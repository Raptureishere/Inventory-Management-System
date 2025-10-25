
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
  const activeClass = 'bg-blue-600 text-white shadow-sm';
  const inactiveClass = 'text-slate-300 hover:bg-blue-700 hover:text-white';

  return (
    <li className="relative group">
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClass : inactiveClass} ${isCollapsed ? 'justify-center' : ''}`
        }
        aria-label={typeof children === 'string' ? (children as string) : undefined}
      >
        <i className={`fas ${icon} w-5 h-5 text-center ${isCollapsed ? '' : 'mr-3'}`} aria-hidden="true"></i>
        {!isCollapsed && <span>{children}</span>}
      </NavLink>
      {isCollapsed && (
         <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg">
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
    <aside className={`bg-slate-800 text-white flex flex-col h-screen shadow-xl relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} border-r border-slate-700`}>
        <button 
          onClick={onToggleCollapse} 
          className="absolute top-6 -right-3 w-6 h-6 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-white focus:outline-none shadow-md z-10 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
      </button>

      <div className={`p-5 border-b border-slate-700 flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
            <i className="fas fa-hospital text-white text-xl"></i>
        </div>
        <div className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-lg font-bold text-white">MCH Inventory</h1>
            <p className="text-xs text-blue-300">Mother & Child Hospital</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {user && user.role === 'admin' && <>
            <NavItem to="/" icon="fa-tachometer-alt" isCollapsed={isCollapsed}>Dashboard</NavItem>
            <NavItem to="/home" icon="fa-house" isCollapsed={isCollapsed}>Home</NavItem>
          </>}
          <NavItem to="/add-items" icon="fa-plus-circle" isCollapsed={isCollapsed}>Inventory Items</NavItem>
          <NavItem to="/requisition-book" icon="fa-book" isCollapsed={isCollapsed}>Requisition Book</NavItem>
          {user && user.role === 'admin' && (
            <>
              <NavItem to="/issued-items-record" icon="fa-dolly-flatbed" isCollapsed={isCollapsed}>Issued Records</NavItem>
              <NavItem to="/purchase-orders" icon="fa-file-invoice" isCollapsed={isCollapsed}>Purchase Orders</NavItem>
              <NavItem to="/suppliers" icon="fa-industry" isCollapsed={isCollapsed}>Suppliers</NavItem>
              <SectionHeader isCollapsed={isCollapsed} collapsedText="Sys" expandedText="System" />
              <NavItem to="/reports" icon="fa-chart-pie" isCollapsed={isCollapsed}>Reports</NavItem>
              <NavItem to="/user-management" icon="fa-users-cog" isCollapsed={isCollapsed}>User Management</NavItem>
            </>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700">
        {user && (
            <div className={`flex items-center p-3 mb-3 rounded-lg bg-slate-700 ${isCollapsed ? 'justify-center' : ''}`}>
               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                 <i className="fas fa-user text-white text-sm"></i>
               </div>
               <div className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                 <p className="font-medium text-white text-sm">{user.username}</p>
                 <p className="text-xs text-slate-400 capitalize">{user.role}</p>
               </div>
            </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <i className={`fas fa-sign-out-alt w-4 h-4 text-center ${isCollapsed ? '' : 'mr-3'}`}></i>
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        
      </div>
    </aside>
  );
};

export default Sidebar;
