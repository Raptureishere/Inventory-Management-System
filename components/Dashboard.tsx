import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { itemStorage, requisitionStorage, issuedRecordStorage } from '../services/storageService';
import { Item, ItemCategory, ItemCategoryLabels, Requisition, IssuedItemRecord } from '../types';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4">
    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
      <i className={`fas ${icon} text-white text-2xl`}></i>
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const LowStockTable: React.FC<{ items: Item[] }> = ({ items }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm h-full">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
      <i className="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
      Low Stock Alerts (Qty &lt; 10)
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 rounded-l-lg">Item Name</th>
            <th scope="col" className="px-6 py-3">Code</th>
            <th scope="col" className="px-6 py-3 rounded-r-lg">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{item.itemName}</td>
              <td className="px-6 py-4">{item.itemCode}</td>
              <td className="px-6 py-4 font-bold text-red-600">{item.quantity}</td>
            </tr>
          ))}
           {items.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-10 text-slate-500">No items are low on stock.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const RecentRequisitionsTable: React.FC<{ requisitions: Requisition[] }> = ({ requisitions }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm h-full">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Requisitions</h3>
    <div className="overflow-x-auto">
       <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 rounded-l-lg">Req. ID</th>
            <th scope="col" className="px-6 py-3">Department</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3 rounded-r-lg">Status</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.map(req => (
            <tr key={req.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{req.id}</td>
              <td className="px-6 py-4">{req.departmentName}</td>
              <td className="px-6 py-4">{new Date(req.dateRequested).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                 <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'Forwarded' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
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
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-sm">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Stock by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie 
                        data={data} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        label={renderCustomizedLabel}
                        outerRadius={110} 
                        innerRadius={60} 
                        fill="#8884d8" 
                        dataKey="value" 
                        nameKey="name" 
                        paddingAngle={5}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
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
            .sort((a, b) => Number(b.quantity) - Number(a.quantity))
            .slice(0, 5);
    }, [items, issuedRecords]);
    
    const legendPayload = data.map((entry, index) => ({
        value: entry.name,
        type: 'circle',
        color: COLORS[index % COLORS.length]
    }));

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-center h-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Issued Items</h3>
                <i className="fas fa-box-open text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-500">No items have been issued yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Issued Items</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 150, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" hide={true} />
                    <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} contentStyle={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}/>
                    <Legend payload={legendPayload} layout="vertical" verticalAlign="middle" align="right" />
                    <Bar dataKey="quantity" name="Quantity Issued" barSize={30} radius={[0, 10, 10, 0]}>
                       {data.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Items in Stock" value={totalItems} icon="fa-boxes" color="bg-sky-500" />
                <StatCard title="Item Categories" value={Object.keys(ItemCategory).length} icon="fa-tags" color="bg-emerald-500" />
                <StatCard title="Pending Requisitions" value={pendingRequisitionsCount} icon="fa-file-alt" color="bg-amber-500" />
                <StatCard title="Low Stock Alerts" value={lowStockItems.length} icon="fa-exclamation-triangle" color="bg-red-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <InventoryPieChart items={items} />
                </div>
                <div className="lg:col-span-2">
                    <TopIssuedItemsChart items={items} issuedRecords={issuedRecords} />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowStockTable items={lowStockItems} />
                <RecentRequisitionsTable requisitions={recentRequisitions} />
            </div>
        </div>
    );
};

export default Dashboard;