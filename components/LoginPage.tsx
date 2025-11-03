import React, { useState } from 'react';
import { User } from '../types';
import api from '../services/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call backend API
      const response = await api.login(username, password);
      
      if (response.token && response.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Call onLogin with user data
        onLogin(response.user as User);
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4 relative overflow-hidden">
        {/* Background Image with Opacity */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        ></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-block bg-white p-4 rounded-full shadow-lg mb-4">
                    <i className="fas fa-clinic-medical text-5xl text-teal-600"></i>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Clinic Inventory</h2>
                <p className="text-gray-600 mt-2">Healthcare Management System</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-slate-600">Username</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-user text-slate-400"></i>
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-teal-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                placeholder="admin or sub"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                         <label htmlFor="password" className="text-sm font-medium text-slate-600">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-lock text-slate-400"></i>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-teal-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                placeholder="admin123 or sub123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <div>
                        <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : (
                          'Sign in'
                        )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
