import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { itemStorage, issuedRecordStorage } from '../services/storageService';
import { Item, IssuedItemRecord, ItemCategoryLabels } from '../types';

const Reports: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [issuedRecords, setIssuedRecords] = useState<IssuedItemRecord[]>([]);
    
    useEffect(() => {
        setItems(itemStorage.get());
        setIssuedRecords(issuedRecordStorage.get());
    }, []);

    const [reportType, setReportType] = useState('stock_balance');
    const [filters, setFilters] = useState({
        category: '',
        department: '',
        dateFrom: '',
        dateTo: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const stockBalanceData = useMemo(() => {
        return items.filter(item => filters.category ? item.category === filters.category : true);
    }, [items, filters.category]);

    const itemMovementData = useMemo(() => {
        // This is a simplified example. A real implementation would process records based on date filters.
        return items.map(item => ({
            name: item.itemName,
            // stockIn is complex without purchase orders, so we'll mock it for the chart
            stockIn: (item.quantity + issuedRecords.flatMap(rec => rec.issuedItems).filter(iss => iss.itemId === item.id).reduce((sum, iss) => sum + iss.issuedQty, 0)) > 20 ? Math.floor(Math.random() * 20) : 0, // Mocked data
            stockOut: issuedRecords
                .flatMap(rec => rec.issuedItems)
                .filter(iss => iss.itemId === item.id)
                .reduce((sum, iss) => sum + iss.issuedQty, 0),
        })).filter(d => d.stockIn > 0 || d.stockOut > 0).slice(0, 10); // show top 10 with movement
    }, [items, issuedRecords]);

    const stockQuantityByCategoryData = useMemo(() => {
        const filteredByDate = items.filter(item => {
            if (filters.dateFrom && item.dateReceived < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && item.dateReceived > filters.dateTo) {
                return false;
            }
            return true;
        });

        const categoryTotals = filteredByDate.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryTotals).map(([category, totalQuantity]) => ({
            name: ItemCategoryLabels[category as keyof typeof ItemCategoryLabels],
            'Total Quantity': totalQuantity,
        }));
    }, [items, filters.dateFrom, filters.dateTo]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Report Type</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="stock_balance">Stock Balance by Category</option>
                            <option value="item_movement">Monthly Item Movement</option>
                            <option value="stock_quantity_category">Stock Quantity by Category</option>
                        </select>
                    </div>
                     <div>
                        {reportType === 'stock_balance' && (
                            <>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select name="category" value={filters.category} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm">
                                    <option value="">All</option>
                                    {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </>
                        )}
                         {reportType === 'stock_quantity_category' && (
                            <div className="flex space-x-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date From</label>
                                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date To</label>
                                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end items-end space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"><i className="fas fa-file-excel mr-2"></i>Export Excel</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"><i className="fas fa-file-pdf mr-2"></i>Export PDF</button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {reportType === 'stock_balance' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Stock Balance Report</h2>
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Item Code</th>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockBalanceData.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">{item.itemCode}</td>
                                        <td className="px-6 py-4 font-medium">{item.itemName}</td>
                                        <td className="px-6 py-4">{ItemCategoryLabels[item.category]}</td>
                                        <td className="px-6 py-4 font-bold">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {reportType === 'item_movement' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Item Movement Report</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={itemMovementData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="stockIn" fill="#82ca9d" name="Stock In" />
                                <Bar dataKey="stockOut" fill="#8884d8" name="Stock Out" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                 {reportType === 'stock_quantity_category' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Stock Quantity by Category</h2>
                        {stockQuantityByCategoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={stockQuantityByCategoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Total Quantity" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 py-10">No data available for the selected filters.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;