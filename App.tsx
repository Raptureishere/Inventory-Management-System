
import React, { useState, useCallback } from 'react';
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('hims_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogin = useCallback((loggedInUser: User) => {
    localStorage.setItem('hims_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('hims_user');
    setUser(null);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={
          user ? (
            <div className="flex h-screen bg-slate-100">
              <Sidebar 
                onLogout={handleLogout} 
                user={user} 
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
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
