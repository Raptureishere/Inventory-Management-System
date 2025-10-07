import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  onLogout: () => void;
  user: User | null;
}

const NavItem: React.FC<{ to: string; icon: string; children: React.ReactNode }> = ({ to, icon, children }) => {
  const activeClass = 'bg-blue-700 text-white';
  const inactiveClass = 'text-blue-100 hover:bg-blue-600 hover:text-white';

  return (
    <li>
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
            isActive ? activeClass : inactiveClass
          }`
        }
      >
        <i className={`fas ${icon} w-6 h-6 mr-3 text-center`}></i>
        <span className="font-medium">{children}</span>
      </NavLink>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onLogout, user }) => {
  return (
    <aside className="w-64 bg-blue-800 text-white flex flex-col h-screen shadow-lg">
      <div className="p-4 border-b border-blue-700">
        <h1 className="text-2xl font-bold text-center">HIMS</h1>
        <p className="text-sm text-center text-blue-200">Hospital Inventory</p>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {user && user.role === 'admin' && <NavItem to="/" icon="fa-tachometer-alt">Dashboard</NavItem>}
          <NavItem to="/add-items" icon="fa-plus-circle">Add Items</NavItem>
          <NavItem to="/requisition-book" icon="fa-book">Requisition Book</NavItem>
          {user && user.role === 'admin' && (
            <>
              <NavItem to="/issued-items-record" icon="fa-dolly-flatbed">Issued Items Record</NavItem>
              <NavItem to="/reports" icon="fa-chart-pie">Reports</NavItem>
              <NavItem to="/user-management" icon="fa-users-cog">User Management</NavItem>
            </>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-blue-700">
        {user && (
            <div className="flex items-center p-2 mb-4 rounded-lg bg-blue-900/50">
               <i className="fas fa-user-shield text-3xl text-blue-300"></i>
               <div className="ml-3">
                 <p className="font-semibold text-white">{user.username}</p>
                 <p className="text-sm text-blue-200 capitalize">{user.role} Page</p>
               </div>
            </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center p-3 rounded-lg text-red-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <i className="fas fa-sign-out-alt w-6 h-6 mr-3 text-center"></i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;