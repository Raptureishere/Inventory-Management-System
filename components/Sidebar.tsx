
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  onLogout: () => void;
  user: User | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemProps {
    to: string; 
    icon: string; 
    children: React.ReactNode;
    isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, isCollapsed }) => {
  const baseClasses = 'flex items-center px-4 py-3 my-1 font-medium rounded-lg transition-all duration-200';
  const activeClass = 'bg-sky-500 text-white shadow-md';
  const inactiveClass = 'text-slate-200 hover:bg-slate-600 hover:text-white';

  return (
    <li className="relative group">
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClass : inactiveClass} ${isCollapsed ? 'justify-center' : ''}`
        }
      >
        <i className={`fas ${icon} w-6 h-6 text-center text-lg ${isCollapsed ? '' : 'mr-3'}`}></i>
        {!isCollapsed && <span className="transition-opacity duration-300">{children}</span>}
      </NavLink>
      {isCollapsed && (
         <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
            {children}
        </div>
      )}
    </li>
  );
};

const SectionHeader: React.FC<{isCollapsed: boolean; collapsedText: string; expandedText: string}> = ({ isCollapsed, collapsedText, expandedText }) => (
    <div className={`px-4 py-2 mt-3 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? collapsedText : expandedText}
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ onLogout, user, isCollapsed, onToggleCollapse }) => {
  return (
    <aside className={`bg-slate-700 text-white flex flex-col h-screen shadow-2xl relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <button 
          onClick={onToggleCollapse} 
          className="absolute top-6 -right-3.5 w-7 h-7 bg-slate-800 hover:bg-sky-500 rounded-full flex items-center justify-center text-white focus:outline-none ring-2 ring-slate-100 z-10 transition-all duration-300"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
      </button>

      <div className={`p-5 border-b border-slate-600 flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="bg-white p-2 rounded-full flex-shrink-0">
            <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-xl font-bold">M&C Hospital</h1>
            <p className="text-xs text-slate-300">Inventory System</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {user && user.role === 'admin' && <NavItem to="/" icon="fa-tachometer-alt" isCollapsed={isCollapsed}>Dashboard</NavItem>}
          <NavItem to="/add-items" icon="fa-plus-circle" isCollapsed={isCollapsed}>Inventory Items</NavItem>
          <NavItem to="/requisition-book" icon="fa-book" isCollapsed={isCollapsed}>Requisition Book</NavItem>
          {user && user.role === 'admin' && (
            <>
              <NavItem to="/issued-items-record" icon="fa-dolly-flatbed" isCollapsed={isCollapsed}>Issued Records</NavItem>
              <SectionHeader isCollapsed={isCollapsed} collapsedText="Sys" expandedText="System" />
              <NavItem to="/reports" icon="fa-chart-pie" isCollapsed={isCollapsed}>Reports</NavItem>
              <NavItem to="/user-management" icon="fa-users-cog" isCollapsed={isCollapsed}>User Management</NavItem>
            </>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-600">
        {user && (
            <div className={`flex items-center p-3 mb-4 rounded-lg bg-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
               <i className="fas fa-user-shield text-3xl text-sky-400 flex-shrink-0"></i>
               <div className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                 <p className="font-semibold text-white">{user.username}</p>
                 <p className="text-sm text-slate-300 capitalize">{user.role}</p>
               </div>
            </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-4 py-3 rounded-lg text-red-300 hover:bg-red-500 hover:text-white transition-colors duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <i className={`fas fa-sign-out-alt w-6 h-6 text-center text-lg ${isCollapsed ? '' : 'mr-3'}`}></i>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
