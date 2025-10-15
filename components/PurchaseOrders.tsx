
import React, { useMemo, useState } from 'react';
import { purchaseOrderStorage, itemStorage, supplierStorage } from '../services/storageService';
import { Item, PurchaseOrder, Supplier } from '../types';
import { useUI } from './ui/UIContext';

const PurchaseOrders: React.FC = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>(() => purchaseOrderStorage.get());
    const [items] = useState<Item[]>(() => itemStorage.get());
    const [search, setSearch] = useState('');
    const [suppliers] = useState<Supplier[]>(() => supplierStorage.get());
    const [form, setForm] = useState<Omit<PurchaseOrder, 'id'>>({
        poNumber: '', supplierName: '', orderDate: new Date().toISOString().slice(0,10), expectedDeliveryDate: '', items: [], status: 'Pending'
    });
    const [newItem, setNewItem] = useState<{ itemId?: number; quantity?: number; unitPrice?: number }>({});
    const { showToast, confirm } = useUI();

    const filtered = useMemo(() => {
        const s = search.toLowerCase();
        return orders.filter(o => o.poNumber.toLowerCase().includes(s) || o.supplierName.toLowerCase().includes(s));
    }, [orders, search]);

    const totals = useMemo(() => {
        const totalCost = form.items.reduce((sum, li) => sum + (li.quantity * (li.unitPrice || 0)), 0);
        const totalLines = form.items.length;
        const totalQty = form.items.reduce((sum, li) => sum + li.quantity, 0);
        return { totalCost, totalLines, totalQty };
    }, [form.items]);

    const addItemToPO = () => {
        if (!newItem.itemId || !newItem.quantity || newItem.quantity <= 0) {
            showToast('Choose an item and quantity', 'error');
            return;
        }
        const item = items.find(i => i.id === newItem.itemId);
        if (!item) return;
        const added = { itemId: item.id, itemName: item.itemName, quantity: newItem.quantity || 1, unitPrice: newItem.unitPrice || 0 };
        setForm(prev => ({ ...prev, items: [...prev.items, added] }));
        setNewItem({});
    };

    const removeItemFromPO = (index: number) => {
        setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const createPO = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.poNumber.trim() || !form.supplierName.trim() || form.items.length === 0) {
            showToast('PO number, supplier, and at least one item are required', 'error');
            return;
        }
        if (orders.some(o => o.poNumber === form.poNumber)) {
            showToast('PO number already exists', 'error');
            return;
        }
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        const newPO: PurchaseOrder = { id: newId, ...form };
        const updated = [...orders, newPO];
        setOrders(updated);
        purchaseOrderStorage.save(updated);
        setForm({ poNumber: '', supplierName: '', orderDate: new Date().toISOString().slice(0,10), expectedDeliveryDate: '', items: [], status: 'Pending' });
        showToast('Purchase Order created', 'success');
    };

    const markReceived = async (po: PurchaseOrder) => {
        const ok = await confirm(`Mark PO ${po.poNumber} as received and increase stock?`, { title: 'Receive Purchase Order', confirmText: 'Receive', cancelText: 'Cancel' });
        if (!ok) return;
        const now = new Date().toISOString().slice(0,10);
        const updatedOrders = orders.map(o => o.id === po.id ? { ...o, status: 'Received', receivedDate: now } : o);
        setOrders(updatedOrders);
        purchaseOrderStorage.save(updatedOrders);
        // Update stock
        const currentItems = itemStorage.get();
        po.items.forEach(poi => {
            const idx = currentItems.findIndex(i => i.id === poi.itemId);
            if (idx > -1) currentItems[idx].quantity += poi.quantity;
        });
        itemStorage.save(currentItems);
        showToast('Stock updated from received PO', 'success');
    };

    const cancelPO = async (poId: number) => {
        const ok = await confirm('Cancel this PO?', { title: 'Cancel Purchase Order', confirmText: 'Cancel PO', cancelText: 'Keep' });
        if (!ok) return;
        const updated = orders.map(o => o.id === poId ? { ...o, status: 'Cancelled' } : o);
        setOrders(updated);
        purchaseOrderStorage.save(updated);
        showToast('Purchase Order cancelled', 'info');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Purchase Orders</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Create Purchase Order</h2>
                <form onSubmit={createPO} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500">PO Number</label>
                            <input className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.poNumber} onChange={e => setForm({ ...form, poNumber: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Supplier</label>
                            <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} required>
                                <option value="" disabled>Select a supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Order Date</label>
                            <input type="date" className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.orderDate} onChange={e => setForm({ ...form, orderDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Expected Delivery</label>
                            <input type="date" className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.expectedDeliveryDate} onChange={e => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="bg-slate-50 border rounded p-3">
                        <div className="flex items-end space-x-2">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-slate-500">Item</label>
                                <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={newItem.itemId || ''} onChange={e => setNewItem({ ...newItem, itemId: parseInt(e.target.value) })}>
                                    <option value="" disabled>Select an item</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Quantity</label>
                                <input type="number" min={1} className="block w-28 px-3 py-2 border border-slate-300 rounded-lg" value={newItem.quantity || ''} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Unit Price</label>
                                <input type="number" min={0} step="0.01" className="block w-32 px-3 py-2 border border-slate-300 rounded-lg" value={newItem.unitPrice || ''} onChange={e => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <button type="button" onClick={addItemToPO} className="h-10 px-4 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">
                                Add Item
                            </button>
                        </div>
                        {form.items.length > 0 && (
                            <div className="overflow-x-auto mt-3">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-2">Item</th>
                                            <th className="px-4 py-2">Quantity</th>
                                            <th className="px-4 py-2">Unit Price</th>
                                            <th className="px-4 py-2">Line Total</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.items.map((li, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="px-4 py-2">{li.itemName}</td>
                                                <td className="px-4 py-2">{li.quantity}</td>
                                                <td className="px-4 py-2">{li.unitPrice?.toFixed(2)}</td>
                                                <td className="px-4 py-2">{(li.quantity * (li.unitPrice || 0)).toFixed(2)}</td>
                                                <td className="px-4 py-2">
                                                    <button onClick={() => removeItemFromPO(idx)} className="text-slate-500 hover:text-red-600" aria-label={`Remove ${li.itemName}`}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {form.items.length > 0 && (
                                            <tr>
                                                <td className="px-4 py-2 font-semibold">Totals</td>
                                                <td className="px-4 py-2 font-semibold">{totals.totalQty}</td>
                                                <td className="px-4 py-2"></td>
                                                <td className="px-4 py-2 font-semibold">{totals.totalCost.toFixed(2)}</td>
                                                <td className="px-4 py-2"></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="text-sm text-slate-600">
                            {form.items.length > 0 && (
                                <span>Lines: <span className="font-semibold">{totals.totalLines}</span>, Qty: <span className="font-semibold">{totals.totalQty}</span>, Total: <span className="font-semibold">{totals.totalCost.toFixed(2)}</span></span>
                            )}
                        </div>
                        <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Create PO</button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">All Purchase Orders</h2>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-slate-400"></i>
                        </div>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by PO number or supplier" className="pl-10 block w-72 px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">PO Number</th>
                                <th className="px-6 py-3">Supplier</th>
                                <th className="px-6 py-3">Order Date</th>
                                <th className="px-6 py-3">Expected</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(po => (
                                <tr key={po.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{po.poNumber}</td>
                                    <td className="px-6 py-4">{po.supplierName}</td>
                                    <td className="px-6 py-4">{po.orderDate}</td>
                                    <td className="px-6 py-4">{po.expectedDeliveryDate || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                            po.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                            po.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>{po.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {po.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => markReceived(po)} className="bg-emerald-500 text-white px-3 py-1 rounded text-xs hover:bg-emerald-600">Receive</button>
                                                    <button onClick={() => cancelPO(po.id)} className="bg-slate-500 text-white px-3 py-1 rounded text-xs hover:bg-slate-600">Cancel</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrders;
