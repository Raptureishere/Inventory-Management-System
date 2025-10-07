import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { itemStorage, requisitionStorage, issuedRecordStorage } from '../services/storageService';
import { Item, ItemCategory, ItemCategoryLabels, Requisition, IssuedItemRecord } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
      <i className={`fas ${icon} text-white text-2xl`}></i>
    </div>
    <div className="ml-4">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const LowStockTable: React.FC<{ items: Item[] }> = ({ items }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
      Low Stock Alerts (Qty &lt; 10)
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Item Name</th>
            <th scope="col" className="px-6 py-3">Code</th>
            <th scope="col" className="px-6 py-3">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{item.itemName}</td>
              <td className="px-6 py-4">{item.itemCode}</td>
              <td className="px-6 py-4 font-bold text-red-600">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RecentRequisitionsTable: React.FC<{ requisitions: Requisition[] }> = ({ requisitions }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Requisitions</h3>
    <div className="overflow-x-auto">
       <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Req. ID</th>
            <th scope="col" className="px-6 py-3">Department</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.map(req => (
            <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{req.id}</td>
              <td className="px-6 py-4">{req.departmentName}</td>
              <td className="px-6 py-4">{new Date(req.dateRequested).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    req.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                    req.status === 'Forwarded' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                  }`}>{req.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const InventoryPieChart: React.FC<{ items: Item[] }> = ({ items }) => {
    const data = useMemo(() => {
        const categoryCounts = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.quantity;
            return acc;
        }, {} as Record<ItemCategory, number>);

        return Object.entries(categoryCounts).map(([category, value]) => ({
            name: ItemCategoryLabels[category as ItemCategory],
            value: value,
        }));
    }, [items]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const TopIssuedItemsChart: React.FC<{ items: Item[], issuedRecords: IssuedItemRecord[] }> = ({ items, issuedRecords }) => {
    const data = useMemo(() => {
        const itemIssueCounts = issuedRecords
            .flatMap(rec => rec.issuedItems)
            .reduce((acc, issuedItem) => {
                acc[issuedItem.itemId] = (acc[issuedItem.itemId] || 0) + issuedItem.issuedQty;
                return acc;
            }, {} as Record<number, number>);

        return Object.entries(itemIssueCounts)
            .map(([itemId, quantity]) => ({
                name: items.find(i => i.id === parseInt(itemId))?.itemName || `Item #${itemId}`,
                quantity,
            }))
            // FIX: Ensure quantity is treated as a number for sorting. Data from storage might be a string.
            .sort((a, b) => Number(b.quantity) - Number(a.quantity))
            .slice(0, 7); // Get top 7
    }, [items, issuedRecords]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Issued Items</h3>
                <p className="text-gray-500">No items have been issued yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Issued Items</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} interval={0} />
                    <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} />
                    <Legend />
                    <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Issued" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [issuedRecords, setIssuedRecords] = useState<IssuedItemRecord[]>([]);

    useEffect(() => {
      // Load data from persistent storage on component mount
      setItems(itemStorage.get());
      setRequisitions(requisitionStorage.get());
      setIssuedRecords(issuedRecordStorage.get());
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = items.filter(item => item.quantity < 10);
    const pendingRequisitionsCount = requisitions.filter(r => r.status === 'Pending').length;
    const recentRequisitions = [...requisitions].sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime()).slice(0, 5);
    
    if (items.length === 0 && requisitions.length === 0) {
      return <div>Loading Dashboard Data...</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total Items in Stock" value={totalItems} icon="fa-boxes" color="bg-blue-500" />
                <StatCard title="Item Categories" value={Object.keys(ItemCategory).length} icon="fa-tags" color="bg-green-500" />
                <StatCard title="Pending Requisitions" value={pendingRequisitionsCount} icon="fa-file-alt" color="bg-yellow-500" />
                <StatCard title="Low Stock Alerts" value={lowStockItems.length} icon="fa-exclamation-triangle" color="bg-red-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <InventoryPieChart items={items} />
                <TopIssuedItemsChart items={items} issuedRecords={issuedRecords} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowStockTable items={lowStockItems} />
                <RecentRequisitionsTable requisitions={recentRequisitions} />
            </div>
        </div>
    );
};

export default Dashboard;
