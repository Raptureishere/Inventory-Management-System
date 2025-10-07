import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS } from '../constants';
import { requisitionStorage, itemStorage } from '../services/storageService';
import { Requisition, RequisitionStatus, User, RequestedItem, Item } from '../types';

const CreateRequisitionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newRequisition: Omit<Requisition, 'id' | 'dateRequested' | 'status'>) => void;
    currentUser: User;
    availableItems: Item[];
}> = ({ isOpen, onClose, onSubmit, currentUser, availableItems }) => {
    
    const [departmentName, setDepartmentName] = useState(DEPARTMENTS[0]);
    const [requestedItems, setRequestedItems] = useState<Partial<RequestedItem>[]>([{ itemId: undefined, quantity: 1 }]);

    if (!isOpen) return null;

    const handleItemChange = (index: number, itemId: number) => {
        const newItems = [...requestedItems];
        newItems[index].itemId = itemId;
        setRequestedItems(newItems);
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...requestedItems];
        newItems[index].quantity = Math.max(1, quantity);
        setRequestedItems(newItems);
    };

    const handleAddItem = () => {
        setRequestedItems([...requestedItems, { itemId: undefined, quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setRequestedItems(requestedItems.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = requestedItems
            .filter(item => item.itemId !== undefined && item.quantity && item.quantity > 0)
            .map(item => ({
                itemId: item.itemId!,
                itemName: availableItems.find(i => i.id === item.itemId)?.itemName || 'Unknown',
                quantity: item.quantity!
            }));
        
        if (finalItems.length > 0) {
            onSubmit({
                departmentName,
                requestedItems: finalItems,
                createdBy: currentUser.id
            });
            onClose(); // Close and reset
            setDepartmentName(DEPARTMENTS[0]);
            setRequestedItems([{ itemId: undefined, quantity: 1 }]);
        } else {
            alert('Please add at least one valid item to the requisition.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Create New Requisition</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Department</label>
                        <select value={departmentName} onChange={e => setDepartmentName(e.target.value)} className="w-full p-2 border rounded">
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Requested Items</label>
                        {requestedItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <select value={item.itemId || ''} onChange={e => handleItemChange(index, parseInt(e.target.value))} className="w-1/2 p-2 border rounded">
                                    <option value="" disabled>Select an item</option>
                                    {availableItems.map(stockItem => <option key={stockItem.id} value={stockItem.id}>{stockItem.itemName}</option>)}
                                </select>
                                <input type="number" value={item.quantity || 1} onChange={e => handleQuantityChange(index, parseInt(e.target.value))} min="1" className="w-1/4 p-2 border rounded" />
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                         <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 hover:text-blue-800">+ Add Item</button>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditRequisitionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedRequisition: Requisition) => void;
    requisition: Requisition | null;
    availableItems: Item[];
}> = ({ isOpen, onClose, onSave, requisition, availableItems }) => {

    const [formData, setFormData] = useState<Requisition | null>(null);

    useEffect(() => {
        if (requisition) {
            setFormData(JSON.parse(JSON.stringify(requisition))); // Deep copy
        }
    }, [requisition]);

    if (!isOpen || !formData) return null;

    const handleDepartmentChange = (dept: string) => {
        setFormData(prev => prev ? { ...prev, departmentName: dept } : null);
    };

    const handleItemChange = (index: number, itemId: number) => {
        if (!formData) return;
        const newItems = [...formData.requestedItems];
        const selectedItem = availableItems.find(i => i.id === itemId);
        if (selectedItem) {
            newItems[index] = { ...newItems[index], itemId: selectedItem.id, itemName: selectedItem.itemName };
            setFormData({ ...formData, requestedItems: newItems });
        }
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        if (!formData) return;
        const newItems = [...formData.requestedItems];
        newItems[index].quantity = Math.max(1, quantity);
        setFormData({ ...formData, requestedItems: newItems });
    };

    const handleAddItem = () => {
        if (!formData) return;
        const newItem: RequestedItem = { itemId: 0, itemName: '', quantity: 1 };
        setFormData({ ...formData, requestedItems: [...formData.requestedItems, newItem] });
    };

    const handleRemoveItem = (index: number) => {
        if (!formData) return;
        const newItems = formData.requestedItems.filter((_, i) => i !== index);
        setFormData({ ...formData, requestedItems: newItems });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = formData.requestedItems
            .filter(item => item.itemId !== 0 && item.quantity > 0);
        
        if (finalItems.length > 0) {
            onSave({ ...formData, requestedItems: finalItems });
        } else {
            alert('A requisition must have at least one valid item.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Edit Requisition (ID: {formData.id})</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Department</label>
                        <select value={formData.departmentName} onChange={e => handleDepartmentChange(e.target.value)} className="w-full p-2 border rounded">
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Requested Items</label>
                        {formData.requestedItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <select value={item.itemId || ''} onChange={e => handleItemChange(index, parseInt(e.target.value))} className="w-1/2 p-2 border rounded">
                                    <option value="" disabled>Select an item</option>
                                    {availableItems.map(stockItem => <option key={stockItem.id} value={stockItem.id}>{stockItem.itemName}</option>)}
                                </select>
                                <input type="number" value={item.quantity || 1} onChange={e => handleQuantityChange(index, parseInt(e.target.value))} min="1" className="w-1/4 p-2 border rounded" />
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                         <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 hover:text-blue-800">+ Add Item</button>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface RequisitionBookProps {
  user: User | null;
}

const RequisitionBook: React.FC<RequisitionBookProps> = ({ user }) => {
    const [requisitions, setRequisitions] = useState<Requisition[]>(() => requisitionStorage.get());
    const [availableItems] = useState<Item[]>(() => itemStorage.get());
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState<RequisitionStatus | ''>('');
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRequisition, setEditingRequisition] = useState<Requisition | null>(null);

    const filteredRequisitions = useMemo(() => {
        return requisitions.filter(req => {
            const matchesDept = filterDept ? req.departmentName === filterDept : true;
            const matchesStatus = filterStatus ? req.status === filterStatus : true;
            return matchesDept && matchesStatus;
        }).sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime());
    }, [requisitions, filterDept, filterStatus]);

    const handleForward = (requisitionId: number) => {
        const updatedRequisitions = requisitions.map(req =>
            req.id === requisitionId ? { ...req, status: RequisitionStatus.FORWARDED } : req
        );
        setRequisitions(updatedRequisitions);
        requisitionStorage.save(updatedRequisitions);
        navigate(`/store-issuing-voucher/${requisitionId}`);
    };

    const handleReject = (requisitionId: number) => {
        if (window.confirm('Are you sure you want to reject this requisition? This action cannot be undone.')) {
            const updatedRequisitions = requisitions.map(req =>
                req.id === requisitionId ? { ...req, status: RequisitionStatus.REJECTED } : req
            );
            setRequisitions(updatedRequisitions);
            requisitionStorage.save(updatedRequisitions);
        }
    };

    const handleDelete = (requisitionId: number) => {
        if (window.confirm('Are you sure you want to permanently delete this requisition? This action cannot be undone.')) {
            const updatedRequisitions = requisitions.filter(req => req.id !== requisitionId);
            setRequisitions(updatedRequisitions);
            requisitionStorage.save(updatedRequisitions);
        }
    };

     const handleCreateRequisition = (newReqData: Omit<Requisition, 'id' | 'dateRequested' | 'status'>) => {
        const newRequisition: Requisition = {
            ...newReqData,
            id: requisitions.length > 0 ? Math.max(...requisitions.map(r => r.id)) + 1 : 101,
            dateRequested: new Date().toISOString(),
            status: RequisitionStatus.PENDING,
        };
        const updatedRequisitions = [...requisitions, newRequisition];
        setRequisitions(updatedRequisitions);
        requisitionStorage.save(updatedRequisitions);
    };

    const handleEditClick = (requisition: Requisition) => {
        setEditingRequisition(requisition);
        setIsEditModalOpen(true);
    };

    const handleUpdateRequisition = (updatedRequisition: Requisition) => {
        const updatedRequisitions = requisitions.map(req => 
            req.id === updatedRequisition.id ? updatedRequisition : req
        );
        setRequisitions(updatedRequisitions);
        requisitionStorage.save(updatedRequisitions);
        setIsEditModalOpen(false);
        setEditingRequisition(null);
    };
    
    return (
        <div>
            {user && (
                <CreateRequisitionModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateRequisition}
                    currentUser={user}
                    availableItems={availableItems}
                />
            )}
            <EditRequisitionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateRequisition}
                requisition={editingRequisition}
                availableItems={availableItems}
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Requisition Book</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">All Requisitions</h2>
                    <div className="flex space-x-4 items-center">
                         {user && (user.role === 'admin' || user.role === 'subordinate') && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                <i className="fas fa-plus mr-2"></i>Create Requisition
                            </button>
                        )}
                        <select
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="">All Departments</option>
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as RequisitionStatus | '')}
                            className="p-2 border rounded"
                        >
                            <option value="">All Statuses</option>
                            {Object.values(RequisitionStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Req. ID</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Date Requested</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequisitions.map(req => (
                                <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{req.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{req.departmentName}</td>
                                    <td className="px-6 py-4">{new Date(req.dateRequested).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside">
                                            {req.requestedItems.map(item => (
                                                <li key={item.itemId}>{item.itemName} (Qty: {item.quantity})</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            req.status === RequisitionStatus.PENDING ? 'bg-yellow-200 text-yellow-800' :
                                            req.status === RequisitionStatus.FORWARDED ? 'bg-blue-200 text-blue-800' :
                                            req.status === RequisitionStatus.ISSUED ? 'bg-green-200 text-green-800' :
                                            req.status === RequisitionStatus.REJECTED ? 'bg-red-200 text-red-800' : ''
                                          }`}>{req.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {user && user.role === 'admin' && req.status === RequisitionStatus.PENDING && (
                                                <>
                                                     <button 
                                                        onClick={() => handleEditClick(req)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit Requisition"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleForward(req.id)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                                                    >
                                                        Forward
                                                    </button>
                                                </>
                                            )}
                                            {user && user.role === 'admin' && req.status === RequisitionStatus.FORWARDED && (
                                                <>
                                                    <button 
                                                        onClick={() => navigate(`/store-issuing-voucher/${req.id}`)}
                                                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                                    >
                                                        Process
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                                        title="Reject Requisition"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {user && user.role === 'admin' && (
                                                <button 
                                                    onClick={() => handleDelete(req.id)} 
                                                    className="text-red-600 hover:text-red-800 px-2"
                                                    title="Delete Requisition"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
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

export default RequisitionBook;