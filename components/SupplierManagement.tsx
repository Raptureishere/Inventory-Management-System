
import React, { useMemo, useState } from 'react';
import { supplierStorage } from '../services/storageService';
import { Supplier } from '../types';
import { useUI } from './ui/UIContext';

const SupplierManagement: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => supplierStorage.get());
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<Omit<Supplier, 'id'>>({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });
    const [editing, setEditing] = useState<Supplier | null>(null);
    const { showToast, confirm } = useUI();

    const filtered = useMemo(() => {
        const s = search.toLowerCase();
        return suppliers.filter(v =>
            v.name.toLowerCase().includes(s) ||
            (v.contactName || '').toLowerCase().includes(s)
        );
    }, [search, suppliers]);

    const resetForm = () => setForm({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast('Supplier name is required', 'error');
            return;
        }
        const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
        const newSupplier: Supplier = { id: newId, ...form } as Supplier;
        const updated = [...suppliers, newSupplier];
        setSuppliers(updated);
        supplierStorage.save(updated);
        resetForm();
        showToast('Supplier added', 'success');
    };

    const startEdit = (s: Supplier) => {
        setEditing(s);
        setForm({ name: s.name, contactName: s.contactName, phone: s.phone, email: s.email, address: s.address, notes: s.notes });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        const updated = suppliers.map(s => (s.id === editing.id ? { ...editing, ...form } : s));
        setSuppliers(updated);
        supplierStorage.save(updated);
        setEditing(null);
        resetForm();
        showToast('Supplier updated', 'success');
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm('Delete this supplier? You cannot undo this.', { title: 'Delete Supplier', confirmText: 'Delete', cancelText: 'Cancel' });
        if (!ok) return;
        const updated = suppliers.filter(s => s.id !== id);
        setSuppliers(updated);
        supplierStorage.save(updated);
        showToast('Supplier deleted', 'info');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Suppliers</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-1">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                    <form onSubmit={editing ? handleUpdate : handleAdd} className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500">Supplier Name</label>
                            <input className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Contact Name</label>
                            <input className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Phone</label>
                            <input className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Address</label>
                            <input className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Notes</label>
                            <textarea className="block w-full px-3 py-2 border border-slate-300 rounded-lg" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
                        </div>
                        <div className="flex space-x-2">
                            <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">{editing ? 'Save Changes' : 'Add Supplier'}</button>
                            {editing && <button type="button" onClick={() => { setEditing(null); resetForm(); }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300">Cancel</button>}
                        </div>
                    </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-800">Supplier List</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-slate-400"></i>
                            </div>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or contact" className="pl-10 block w-72 px-3 py-2 border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Contact</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                                        <td className="px-6 py-4">{s.contactName || '-'}</td>
                                        <td className="px-6 py-4">{s.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button onClick={() => startEdit(s)} className="text-slate-500 hover:text-sky-600" title="Edit Supplier" aria-label={`Edit ${s.name}`}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} className="text-slate-500 hover:text-red-600" title="Delete Supplier" aria-label={`Delete ${s.name}`}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-500">No suppliers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierManagement;
