import React, { useState, useMemo, useEffect, useRef } from 'react';
import { itemStorage } from '../services/storageService';
import { Item, ItemCategory, ItemCategoryLabels, User, ItemCategoryKeysByLabel } from '../types';
import { useUI } from './ui/UIContext';

declare const XLSX: any;

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${props.className}`} />
);

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${props.className}`} />
);

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button {...props} className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 ${props.className}`}>
        {children}
    </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button {...props} className={`px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 ${props.className}`}>
        {children}
    </button>
);


interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
    onSave: (item: Item) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, item, onSave }) => {
    const [formData, setFormData] = useState<Item | null>(null);

    useEffect(() => {
        if (item) {
            setFormData(item);
        }
    }, [item]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: name === 'quantity' ? Number(value) : value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Item</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Item Name</label>
                        <StyledInput type="text" name="itemName" value={formData.itemName} onChange={handleChange} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                        <StyledSelect name="category" value={formData.category} onChange={handleChange}>
                            {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </StyledSelect>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                        <StyledInput type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Unit</label>
                        <StyledInput type="text" name="unit" value={formData.unit} onChange={handleChange} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date Received</label>
                        <StyledInput type="date" name="dateReceived" value={formData.dateReceived} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Supplier</label>
                        <StyledInput type="text" name="supplier" value={formData.supplier} onChange={handleChange} required />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                        <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit">Save Changes</PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface AddItemsProps {
  user: User | null;
}

const AddItems: React.FC<AddItemsProps> = ({ user }) => {
    const [items, setItems] = useState<Item[]>(() => itemStorage.get());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast, confirm } = useUI();
    const [importPreview, setImportPreview] = useState<{ rows: any[]; summary: { newItems: number; updates: number } } | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    const [newItem, setNewItem] = useState<Omit<Item, 'id' | 'itemCode'>>({
        itemName: '',
        category: ItemCategory.STATIONERY,
        quantity: 0,
        unit: 'pcs',
        dateReceived: new Date().toISOString().split('T')[0],
        supplier: ''
    });

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory ? item.category === filterCategory : true;
            return matchesSearch && matchesCategory;
        }).sort((a,b) => a.itemName.localeCompare(b.itemName));
    }, [items, searchTerm, filterCategory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const newItemWithId: Item = {
            ...newItem,
            id: newId,
            itemCode: `${newItem.category}${String(newId).padStart(3, '0')}`,
            quantity: Number(newItem.quantity)
        };
        const updatedItems = [...items, newItemWithId];
        setItems(updatedItems);
        itemStorage.save(updatedItems);
        setNewItem({
            itemName: '', category: ItemCategory.STATIONERY, quantity: 0, unit: 'pcs', dateReceived: new Date().toISOString().split('T')[0], supplier: ''
        });
        showToast('Item added successfully', 'success');
    };

    const handleEditClick = (item: Item) => {
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const handleUpdateItem = (updatedItem: Item) => {
        const updatedItems = items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        setItems(updatedItems);
        itemStorage.save(updatedItems);
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = async (itemId: number) => {
        const ok = await confirm('Delete this item? This action cannot be undone.', { title: 'Delete Item', confirmText: 'Delete', cancelText: 'Cancel' });
        if (!ok) return;
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        itemStorage.save(updatedItems);
        showToast('Item deleted', 'info');
    };

    const processImportedItems = (importedData: any[]) => {
        let updatedItems = [...items];
        let newItemsCount = 0;
        let updatedItemsCount = 0;
        
        importedData.forEach(row => {
            const itemName = row['Item Name']?.toString().trim();
            const quantity = Number(row['Quantity']);
            
            if (!itemName || !quantity || isNaN(quantity) || quantity <= 0) {
                console.warn('Skipping row with invalid data:', row);
                return;
            }

            const existingItemIndex = updatedItems.findIndex(
                item => item.itemName.toLowerCase() === itemName.toLowerCase()
            );

            if (existingItemIndex > -1) {
                const existingItem = updatedItems[existingItemIndex];
                let newDateReceived = existingItem.dateReceived;
                if(row['Date Received']) {
                    const dateReceived = new Date(row['Date Received']);
                    if (!isNaN(dateReceived.getTime())) {
                       newDateReceived = dateReceived.toISOString().split('T')[0];
                    }
                }
                const updatedExistingItem = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                    supplier: row['Supplier']?.toString() || existingItem.supplier,
                    dateReceived: newDateReceived,
                    unit: row['Unit']?.toString() || existingItem.unit,
                };
                updatedItems[existingItemIndex] = updatedExistingItem;
                updatedItemsCount++;
            } else {
                const categoryLabel = row['Category']?.toString().trim();
                const categoryKey = ItemCategoryKeysByLabel[categoryLabel];

                if (!categoryKey) {
                    console.warn(`Skipping new item with unknown category '${categoryLabel}':`, row);
                    return;
                }

                const newId = updatedItems.length > 0 ? Math.max(...updatedItems.map(i => i.id), 0) + 1 : 1;
                let dateReceived = new Date().toISOString().split('T')[0];
                if(row['Date Received']) {
                    const parsedDate = new Date(row['Date Received']);
                    if (!isNaN(parsedDate.getTime())) {
                        dateReceived = parsedDate.toISOString().split('T')[0];
                    }
                }

                const newItem: Item = {
                    id: newId,
                    itemName: itemName,
                    itemCode: `${categoryKey}${String(newId).padStart(3, '0')}`,
                    category: categoryKey,
                    quantity: quantity,
                    unit: row['Unit']?.toString() || 'pcs',
                    dateReceived: dateReceived,
                    supplier: row['Supplier']?.toString() || 'Unknown'
                };
                updatedItems.push(newItem);
                newItemsCount++;
            }
        });
        
        setItems(updatedItems);
        itemStorage.save(updatedItems);
        showToast(`Import complete: ${newItemsCount} new, ${updatedItemsCount} updated`, 'success', 5000);
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsImporting(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                
                // Build preview
                let newItemsCount = 0;
                let updatedItemsCount = 0;
                const rowsWithStatus = (json as any[]).map(row => {
                    const itemName = row['Item Name']?.toString().trim();
                    const quantity = Number(row['Quantity']);
                    const exists = itemName && items.some(i => i.itemName.toLowerCase() === itemName.toLowerCase());
                    const valid = !!itemName && !isNaN(quantity) && quantity > 0;
                    if (valid) {
                        if (exists) updatedItemsCount++; else newItemsCount++;
                    }
                    return { ...row, __status: !valid ? 'Invalid' : exists ? 'Update' : 'New' };
                });
                setImportPreview({ rows: rowsWithStatus, summary: { newItems: newItemsCount, updates: updatedItemsCount } });
                setIsPreviewOpen(true);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                showToast("Failed to process the Excel file. Please use the provided template.", 'error', 6000);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.onerror = () => {
             console.error("Error reading file");
             showToast("An error occurred while reading the file.", 'error');
             setIsImporting(false);
        };
        reader.readAsBinaryString(file);
    };

    const handleConfirmImport = () => {
        if (!importPreview) return;
        const validRows = importPreview.rows.filter(r => r.__status === 'New' || r.__status === 'Update')
            .map(({ __status, ...row }) => row);
        processImportedItems(validRows as any[]);
        setIsPreviewOpen(false);
        setImportPreview(null);
    };

    const handleCancelImport = () => {
        setIsPreviewOpen(false);
        setImportPreview(null);
        showToast('Import cancelled', 'info');
    };

    const handleDownloadTemplate = () => {
        // Construct a simple CSV template for broad compatibility
        const headers = ['Item Name','Category','Quantity','Unit','Date Received','Supplier'];
        const sample = [
            ['A4 Paper Ream','Stationery','50','reams','2025-01-15','Office Supplies Inc.']
        ];
        const csv = [headers.join(','), ...sample.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory-import-template.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Template downloaded', 'info');
    };

    return (
        <div className="space-y-6">
            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                item={editingItem}
                onSave={handleUpdateItem}
            />

            <h1 className="text-3xl font-bold text-slate-800">Inventory Items</h1>

            {user && user.role === 'admin' && (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-800">Add New Item</h2>
                        <div>
                                <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileImport} 
                                style={{ display: 'none' }} 
                                accept=".xlsx, .xls" 
                                disabled={isImporting}
                            />
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 flex items-center transition-all duration-200"
                                    disabled={isImporting}
                                >
                                    <i className={`fas ${isImporting ? 'fa-spinner fa-spin' : 'fa-file-excel'} mr-2`}></i>
                                    {isImporting ? 'Importing...' : 'Import from Excel'}
                                </button>
                                <button 
                                    onClick={handleDownloadTemplate}
                                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all duration-200"
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    Download Template
                                </button>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                             <label className="text-xs font-medium text-slate-500">Item Name</label>
                             <StyledInput type="text" name="itemName" value={newItem.itemName} onChange={handleInputChange} placeholder="e.g., A4 Paper Ream" required />
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500">Category</label>
                            <StyledSelect name="category" value={newItem.category} onChange={handleInputChange}>
                                {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </StyledSelect>
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500">Quantity</label>
                             <StyledInput type="number" name="quantity" value={newItem.quantity} onChange={handleInputChange} placeholder="0" required min="0" />
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500">Unit</label>
                             <StyledInput type="text" name="unit" value={newItem.unit} onChange={handleInputChange} placeholder="e.g., pcs, boxes" required />
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500">Date Received</label>
                            <StyledInput type="date" name="dateReceived" value={newItem.dateReceived} onChange={handleInputChange} required />
                        </div>
                        <div className="lg:col-span-2">
                             <label className="text-xs font-medium text-slate-500">Supplier</label>
                             <StyledInput type="text" name="supplier" value={newItem.supplier} onChange={handleInputChange} placeholder="Supplier Name" required />
                        </div>
                        <PrimaryButton type="submit" className="w-full lg:w-auto lg:col-start-4">Add Item</PrimaryButton>
                    </form>
                </div>
            )}


            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Item List</h2>
                <div className="flex justify-between mb-4">
                    <div className="relative w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-slate-400"></i>
                        </div>
                        <StyledInput 
                            type="text" 
                            placeholder="Search by name or code..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                     <StyledSelect 
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value as ItemCategory | '')}
                        className="w-1/4"
                    >
                        <option value="">All Categories</option>
                        {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </StyledSelect>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Item Code</th>
                                <th className="px-6 py-3">Item Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-center">Quantity</th>
                                <th className="px-6 py-3">Unit</th>
                                <th className="px-6 py-3">Date Received</th>
                                <th className="px-6 py-3 text-center rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-sky-600">{item.itemCode}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.itemName}</td>
                                    <td className="px-6 py-4">{ItemCategoryLabels[item.category]}</td>
                                    <td className={`px-6 py-4 font-bold text-center ${item.quantity < 10 ? 'text-red-600' : 'text-slate-900'}`}>{item.quantity}</td>
                                    <td className="px-6 py-4">{item.unit}</td>
                                    <td className="px-6 py-4">{item.dateReceived}</td>
                                    <td className="px-6 py-4 text-center">
                                        {user && user.role === 'admin' ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <button 
                                                    onClick={() => handleEditClick(item)}
                                                    className="text-slate-500 hover:text-sky-600"
                                                    title="Edit Item"
                                                    aria-label={`Edit ${item.itemName}`}
                                                >
                                                    <i className="fas fa-edit text-lg"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id)} 
                                                    className="text-slate-500 hover:text-red-600"
                                                    title="Delete Item"
                                                    aria-label={`Delete ${item.itemName}`}
                                                >
                                                    <i className="fas fa-trash text-lg"></i>
                                                </button>
                                            </div>
                                        ) : (
                                          <span className="text-xs text-slate-400">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isPreviewOpen && importPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">Import Preview</h2>
                        <p className="text-slate-600 mb-4">New: <span className="font-semibold">{importPreview.summary.newItems}</span> | Updates: <span className="font-semibold">{importPreview.summary.updates}</span></p>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2">Item Name</th>
                                        <th className="px-4 py-2">Category</th>
                                        <th className="px-4 py-2">Quantity</th>
                                        <th className="px-4 py-2">Unit</th>
                                        <th className="px-4 py-2">Date Received</th>
                                        <th className="px-4 py-2">Supplier</th>
                                        <th className="px-4 py-2">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importPreview.rows.map((r, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="px-4 py-2">{r['Item Name'] || ''}</td>
                                            <td className="px-4 py-2">{r['Category'] || ''}</td>
                                            <td className="px-4 py-2">{r['Quantity'] || ''}</td>
                                            <td className="px-4 py-2">{r['Unit'] || ''}</td>
                                            <td className="px-4 py-2">{r['Date Received'] || ''}</td>
                                            <td className="px-4 py-2">{r['Supplier'] || ''}</td>
                                            <td className={`px-4 py-2 font-medium ${r.__status === 'Invalid' ? 'text-red-600' : r.__status === 'New' ? 'text-emerald-600' : 'text-sky-600'}`}>{r.__status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button onClick={handleCancelImport} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300">Cancel</button>
                            <button onClick={handleConfirmImport} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">Confirm Import</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddItems;