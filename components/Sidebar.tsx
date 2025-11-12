
import React, { useState, useEffect } from 'react';
import logo from '../src/assets/hms.png';
import { NavLink } from 'react-router-dom';
import { User } from '../types';
import { requisitionStorage } from '../services/storageService';
import { Requisition, RequisitionStatus } from '../types';

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
    showAlert?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, isCollapsed, showAlert = false }) => {
  const baseClasses = 'flex items-center px-4 py-3 my-1 font-medium rounded-lg transition-all duration-200';
  const activeClass = 'bg-teal-600 text-white shadow-sm';
  const inactiveClass = 'text-slate-300 hover:bg-teal-700 hover:text-white';

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
        <div className="relative">
          <i className={`fas ${icon} w-5 h-5 text-center ${isCollapsed ? '' : 'mr-3'}`} aria-hidden="true"></i>
          {showAlert && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse" aria-label="Pending requisitions alert"></span>
          )}
        </div>
        {!isCollapsed && (
          <span className="flex items-center">
            {children}
            {showAlert && (
              <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-label="Pending requisitions"></span>
            )}
          </span>
        )}
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
  const [hasPendingRequisitions, setHasPendingRequisitions] = useState(false);

  useEffect(() => {
    const checkPendingRequisitions = () => {
      const requisitions = requisitionStorage.get();
      const pendingCount = requisitions.filter(r => r.status === RequisitionStatus.PENDING).length;
      setHasPendingRequisitions(pendingCount > 0);
    };

    // Check immediately
    checkPendingRequisitions();

    // Check periodically (every 5 seconds) to update if requisitions change
    const interval = setInterval(checkPendingRequisitions, 5000);

    // Also listen for storage changes (when data is updated in other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hims_requisitions') {
        checkPendingRequisitions();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <aside className={`bg-slate-800 text-white flex flex-col h-screen shadow-xl relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} border-r border-slate-700`}>
        <button 
          onClick={onToggleCollapse} 
          className="absolute top-6 -right-3 w-6 h-6 bg-slate-700 hover:bg-teal-600 rounded-full flex items-center justify-center text-white focus:outline-none shadow-md z-10 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
      </button>

      <div className={`p-5 border-b border-slate-700 flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <img
          src={logo}
          alt="Clinic Inventory Logo"
          className="w-10 h-10 rounded-lg object-contain flex-shrink-0"
        />
        <div className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-lg font-bold text-white">Clinic Inventory</h1>
            <p className="text-xs text-teal-300">Healthcare Management</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {user && user.role === 'admin' && <>
            <NavItem to="/" icon="fa-tachometer-alt" isCollapsed={isCollapsed} showAlert={hasPendingRequisitions}>Dashboard</NavItem>
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
               <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
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
