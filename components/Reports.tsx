
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { itemStorage, issuedRecordStorage, purchaseOrderStorage } from '../services/storageService';
import { Item, IssuedItemRecord, ItemCategoryLabels, PurchaseOrder } from '../types';
import { useUI } from './ui/UIContext';

declare const XLSX: any;

const Reports: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [issuedRecords, setIssuedRecords] = useState<IssuedItemRecord[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    
    useEffect(() => {
        setItems(itemStorage.get());
        setIssuedRecords(issuedRecordStorage.get());
        setPurchaseOrders(purchaseOrderStorage.get());
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

    const { showToast } = useUI();

    const exportToExcel = () => {
        try {
            let ws;
            if (reportType === 'stock_balance') {
                const data = stockBalanceData.map(item => ({
                    'Item Code': item.itemCode,
                    'Item Name': item.itemName,
                    'Category': ItemCategoryLabels[item.category],
                    'Quantity': item.quantity,
                }));
                ws = XLSX.utils.json_to_sheet(data);
            } else if (reportType === 'item_movement') {
                ws = XLSX.utils.json_to_sheet(itemMovementData);
            } else {
                ws = XLSX.utils.json_to_sheet(stockQuantityByCategoryData);
            }
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            const filename = `report_${reportType}_${new Date().toISOString().slice(0,10)}.xlsx`;
            XLSX.writeFile(wb, filename);
            showToast('Report exported to Excel', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to export to Excel', 'error');
        }
    };

    const printReport = () => {
        window.print();
        showToast('Opening print preview…', 'info');
    };
    
    const stockBalanceData = useMemo(() => {
        return items.filter(item => filters.category ? item.category === filters.category : true);
    }, [items, filters.category]);

    const itemMovementData = useMemo(() => {
        const stockInMap = new Map<number, number>();
        const stockOutMap = new Map<number, number>();

        const filteredPOs = purchaseOrders.filter(po => {
            if (po.status !== 'Received' || !po.receivedDate) return false;
            if (filters.dateFrom && po.receivedDate < filters.dateFrom) return false;
            if (filters.dateTo && po.receivedDate > filters.dateTo) return false;
            return true;
        });

        for (const po of filteredPOs) {
            for (const item of po.items) {
                stockInMap.set(item.itemId, (stockInMap.get(item.itemId) || 0) + item.quantity);
            }
        }

        const filteredIssuedRecords = issuedRecords.filter(rec => {
            if (filters.dateFrom && rec.issueDate < filters.dateFrom) return false;
            if (filters.dateTo && rec.issueDate > filters.dateTo) return false;
            return true;
        });

        for (const rec of filteredIssuedRecords) {
            for (const item of rec.issuedItems) {
                stockOutMap.set(item.itemId, (stockOutMap.get(item.itemId) || 0) + item.issuedQty);
            }
        }

        const allItemIds = new Set([...stockInMap.keys(), ...stockOutMap.keys()]);
        
        return Array.from(allItemIds).map(itemId => {
            const item = items.find(i => i.id === itemId);
            return {
                name: item ? item.itemName : `Item ID ${itemId}`,
                stockIn: stockInMap.get(itemId) || 0,
                stockOut: stockOutMap.get(itemId) || 0,
            };
        }).filter(d => d.stockIn > 0 || d.stockOut > 0);
    }, [items, issuedRecords, purchaseOrders, filters.dateFrom, filters.dateTo]);

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
                            <option value="item_movement">Item Movement</option>
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
                         {(reportType === 'item_movement' || reportType === 'stock_quantity_category') && (
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
                        <button onClick={exportToExcel} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"><i className="fas fa-file-excel mr-2"></i>Export Excel</button>
                        <button onClick={printReport} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"><i className="fas fa-file-pdf mr-2"></i>Export PDF</button>
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
                        {itemMovementData.length > 0 ? (
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
                        ) : (
                            <p className="text-center text-gray-500 py-10">No item movement data available for the selected filters.</p>
                        )}
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
