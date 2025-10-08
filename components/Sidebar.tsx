import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  onLogout: () => void;
  user: User | null;
}

const NavItem: React.FC<{ to: string; icon: string; children: React.ReactNode }> = ({ to, icon, children }) => {
  const baseClasses = 'flex items-center px-4 py-3 my-1 font-medium rounded-lg transition-all duration-200';
  const activeClass = 'bg-sky-500 text-white shadow-md';
  const inactiveClass = 'text-slate-200 hover:bg-slate-600 hover:text-white';

  return (
    <li>
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClass : inactiveClass}`
        }
      >
        <i className={`fas ${icon} w-6 h-6 mr-3 text-center text-lg`}></i>
        <span>{children}</span>
      </NavLink>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onLogout, user }) => {
  return (
    <aside className="w-64 bg-slate-700 text-white flex flex-col h-screen shadow-2xl">
      <div className="p-5 border-b border-slate-600 flex items-center justify-center space-x-3">
        <div className="bg-white p-2 rounded-full">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="text-left">
            <h1 className="text-xl font-bold">M&C Hospital</h1>
            <p className="text-xs text-slate-300">Inventory System</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {user && user.role === 'admin' && <NavItem to="/" icon="fa-tachometer-alt">Dashboard</NavItem>}
          <NavItem to="/add-items" icon="fa-plus-circle">Inventory Items</NavItem>
          <NavItem to="/requisition-book" icon="fa-book">Requisition Book</NavItem>
          {user && user.role === 'admin' && (
            <>
              <NavItem to="/issued-items-record" icon="fa-dolly-flatbed">Issued Records</NavItem>
              <NavItem to="/reports" icon="fa-chart-pie">Reports</NavItem>
              <NavItem to="/user-management" icon="fa-users-cog">User Management</NavItem>
            </>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-600">
        {user && (
            <div className="flex items-center p-3 mb-4 rounded-lg bg-slate-800">
               <i className="fas fa-user-shield text-3xl text-sky-400"></i>
               <div className="ml-3">
                 <p className="font-semibold text-white">{user.username}</p>
                 <p className="text-sm text-slate-300 capitalize">{user.role}</p>
               </div>
            </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-red-300 hover:bg-red-500 hover:text-white transition-colors duration-200 group"
        >
          <i className="fas fa-sign-out-alt w-6 h-6 mr-3 text-center text-lg"></i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
