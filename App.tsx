import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AddItems from './components/AddItems';
import RequisitionBook from './components/RequisitionBook';
import StoreIssuingVoucher from './components/StoreIssuingVoucher';
import IssuedItemsRecord from './components/IssuedItemsRecord';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import UserManagement from './components/UserManagement';
import { User } from './types';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for an existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = sessionStorage.getItem('hims_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    sessionStorage.setItem('hims_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(async () => {
    await apiService.auth.logout();
    sessionStorage.removeItem('hims_user');
    setUser(null);
  }, []);
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={
          user ? (
            <div className="flex h-screen bg-slate-100">
              <Sidebar onLogout={handleLogout} user={user} />
              <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Routes>
                    {/* Common Routes */}
                    <Route path="/add-items" element={<AddItems user={user} />} />
                    <Route path="/requisition-book" element={<RequisitionBook user={user} />} />

                    {/* Admin-only Routes */}
                    {user.role === 'admin' && (
                      <>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/store-issuing-voucher/:id" element={<StoreIssuingVoucher />} />
                        <Route path="/issued-items-record" element={<IssuedItemsRecord />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/user-management" element={<UserManagement />} />
                      </>
                    )}

                    {/* Subordinate Default Redirect */}
                    {user.role === 'subordinate' && (
                       <Route path="/" element={<Navigate to="/requisition-book" />} />
                    )}

                    {/* Catch-all Redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
