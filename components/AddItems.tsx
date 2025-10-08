import React, { useState, useMemo, useEffect, useRef } from 'react';
import { itemStorage } from '../services/storageService';
import { Item, ItemCategory, ItemCategoryLabels, User, ItemCategoryKeysByLabel } from '../types';

declare const XLSX: any;

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Edit Item</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md">
                            {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" min="0" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Unit</label>
                        <input type="text" name="unit" value={formData.unit} onChange={handleChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Date Received</label>
                        <input type="date" name="dateReceived" value={formData.dateReceived} onChange={handleChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
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
        });
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

    const handleDeleteItem = (itemId: number) => {
        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            const updatedItems = items.filter(item => item.id !== itemId);
            setItems(updatedItems);
            itemStorage.save(updatedItems);
        }
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
                existingItem.quantity += quantity;
                existingItem.supplier = row['Supplier']?.toString() || existingItem.supplier;
                if(row['Date Received']) {
                    const dateReceived = new Date(row['Date Received']);
                    if (!isNaN(dateReceived.getTime())) {
                       existingItem.dateReceived = dateReceived.toISOString().split('T')[0];
                    }
                }
                existingItem.unit = row['Unit']?.toString() || existingItem.unit;
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
        alert(`Import Complete!\n- ${newItemsCount} new items were added.\n- ${updatedItemsCount} existing items were updated.`);
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
                
                processImportedItems(json);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                alert("Failed to process the Excel file. Please ensure it has the correct format and column headers: 'Item Name', 'Category', 'Quantity', 'Unit', 'Date Received', 'Supplier'.");
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.onerror = () => {
             console.error("Error reading file");
             alert("An error occurred while reading the file.");
             setIsImporting(false);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                item={editingItem}
                onSave={handleUpdateItem}
            />

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Items</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-semibold">Add New Item</h2>
                     {user && user.role === 'admin' && (
                        <div>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileImport} 
                                style={{ display: 'none' }} 
                                accept=".xlsx, .xls" 
                                disabled={isImporting}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                                disabled={isImporting}
                            >
                                <i className={`fas ${isImporting ? 'fa-spinner fa-spin' : 'fa-file-excel'} mr-2`}></i>
                                {isImporting ? 'Importing...' : 'Import from Excel'}
                            </button>
                        </div>
                     )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" name="itemName" value={newItem.itemName} onChange={handleInputChange} placeholder="Item Name" required className="p-2 border rounded" />
                    <select name="category" value={newItem.category} onChange={handleInputChange} className="p-2 border rounded">
                        {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <input type="number" name="quantity" value={newItem.quantity} onChange={handleInputChange} placeholder="Quantity" required className="p-2 border rounded" min="0" />
                    <input type="text" name="unit" value={newItem.unit} onChange={handleInputChange} placeholder="Unit (e.g., pcs, boxes)" required className="p-2 border rounded" />
                    <input type="date" name="dateReceived" value={newItem.dateReceived} onChange={handleInputChange} required className="p-2 border rounded" />
                    <input type="text" name="supplier" value={newItem.supplier} onChange={handleInputChange} placeholder="Supplier Name" required className="p-2 border rounded" />
                    <button type="submit" className="md:col-start-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Item</button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Item List</h2>
                <div className="flex justify-between mb-4">
                    <input 
                        type="text" 
                        placeholder="Search by name or code..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-2 border rounded w-1/3"
                    />
                     <select 
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value as ItemCategory | '')}
                        className="p-2 border rounded w-1/4"
                    >
                        <option value="">All Categories</option>
                        {Object.entries(ItemCategoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Item Code</th>
                                <th className="px-6 py-3">Item Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Quantity</th>
                                <th className="px-6 py-3">Unit</th>
                                <th className="px-6 py-3">Date Received</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className={`border-b ${item.quantity < 10 ? 'bg-red-50' : 'bg-white'}`}>
                                    <td className="px-6 py-4">{item.itemCode}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.itemName}</td>
                                    <td className="px-6 py-4">{ItemCategoryLabels[item.category]}</td>
                                    <td className={`px-6 py-4 font-bold ${item.quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</td>
                                    <td className="px-6 py-4">{item.unit}</td>
                                    <td className="px-6 py-4">{item.dateReceived}</td>
                                    <td className="px-6 py-4">
                                        {user && user.role === 'admin' && (
                                            <>
                                                <button 
                                                    onClick={() => handleEditClick(item)}
                                                    className="text-blue-600 hover:text-blue-800 mr-2"
                                                    title="Edit Item"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id)} 
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete Item"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        )}
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

export default AddItems;