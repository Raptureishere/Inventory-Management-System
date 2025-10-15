import React from 'react';
import { Link } from 'react-router-dom';

const ActionCard: React.FC<{ to: string; icon: string; title: string; description: string; color: string }>
  = ({ to, icon, title, description, color }) => (
  <Link to={to} className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start">
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-white mr-4 ${color}`}>
        <i className={`fas ${icon} text-2xl`}></i>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="text-slate-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  </Link>
);

const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Welcome</h1>
      <p className="text-slate-600">Choose what you want to do:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard to="/add-items" icon="fa-boxes" title="Inventory Items" description="Add, edit, or search items in stock." color="bg-sky-500" />
        <ActionCard to="/requisition-book" icon="fa-book" title="Requests" description="Create a request for items or manage requests." color="bg-emerald-500" />
        <ActionCard to="/issued-items-record" icon="fa-dolly-flatbed" title="Issued Records" description="See vouchers for items that were issued." color="bg-violet-500" />
        <ActionCard to="/purchase-orders" icon="fa-file-invoice" title="Purchase Orders" description="Create or receive orders to update stock." color="bg-indigo-500" />
        <ActionCard to="/suppliers" icon="fa-industry" title="Suppliers" description="Manage supplier information and contacts." color="bg-teal-600" />
        <ActionCard to="/reports" icon="fa-chart-pie" title="Reports" description="View and export stock and movement reports." color="bg-amber-500" />
        <ActionCard to="/user-management" icon="fa-users-cog" title="User Management" description="Add or remove staff accounts." color="bg-slate-600" />
      </div>
    </div>
  );
};

export default Home;


