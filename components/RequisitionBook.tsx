import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS } from '../constants';
import { requisitionStorage, itemStorage } from '../services/storageService';
import { Requisition, RequisitionStatus, User, RequestedItem, Item } from '../types';
import { useUI } from './ui/UIContext';

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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Requisition</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                        <StyledSelect value={departmentName} onChange={e => setDepartmentName(e.target.value)}>
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </StyledSelect>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Requested Items</label>
                        <div className="space-y-2">
                            {requestedItems.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <StyledSelect value={item.itemId || ''} onChange={e => handleItemChange(index, parseInt(e.target.value))} className="flex-1">
                                        <option value="" disabled>Select an item</option>
                                        {availableItems.map(stockItem => <option key={stockItem.id} value={stockItem.id}>{stockItem.itemName}</option>)}
                                    </StyledSelect>
                                    <StyledInput type="number" value={item.quantity || 1} onChange={e => handleQuantityChange(index, parseInt(e.target.value))} min="1" className="w-24" />
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-slate-400 hover:text-red-500 p-2" aria-label={`Remove item ${index + 1}`}>
                                        <i className="fas fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={handleAddItem} className="text-sm font-medium text-sky-600 hover:text-sky-800 mt-2">+ Add Another Item</button>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit" aria-label="Submit Request">Submit Request</PrimaryButton>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Requisition (ID: {formData.id})</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                        <StyledSelect value={formData.departmentName} onChange={e => handleDepartmentChange(e.target.value)}>
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </StyledSelect>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Requested Items</label>
                        <div className="space-y-2">
                            {formData.requestedItems.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <StyledSelect value={item.itemId || ''} onChange={e => handleItemChange(index, parseInt(e.target.value))} className="flex-1">
                                        <option value="" disabled>Select an item</option>
                                        {availableItems.map(stockItem => <option key={stockItem.id} value={stockItem.id}>{stockItem.itemName}</option>)}
                                    </StyledSelect>
                                    <StyledInput type="number" value={item.quantity || 1} onChange={e => handleQuantityChange(index, parseInt(e.target.value))} min="1" className="w-24" />
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-slate-400 hover:text-red-500 p-2" aria-label={`Remove item ${index + 1}`}>
                                        <i className="fas fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={handleAddItem} className="text-sm font-medium text-sky-600 hover:text-sky-800 mt-2">+ Add Another Item</button>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit">Save Changes</PrimaryButton>
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
    const { confirm, showToast } = useUI();

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
        showToast('Request forwarded to issuing', 'success');
    };

    const handleCancel = async (requisitionId: number) => {
        const ok = await confirm('Cancel this request? You cannot undo this.', { title: 'Cancel Request', confirmText: 'Cancel Request', cancelText: 'Keep' });
        if (!ok) return;
            const updatedRequisitions = requisitions.map(req =>
                req.id === requisitionId ? { ...req, status: RequisitionStatus.CANCELLED } : req
            );
            setRequisitions(updatedRequisitions);
            requisitionStorage.save(updatedRequisitions);
        showToast('Request cancelled', 'info');
    };

    const handleDelete = async (requisitionId: number) => {
        const ok = await confirm('Delete this request permanently? This cannot be undone.', { title: 'Delete Request', confirmText: 'Delete', cancelText: 'Cancel' });
        if (!ok) return;
            const updatedRequisitions = requisitions.filter(req => req.id !== requisitionId);
            setRequisitions(updatedRequisitions);
            requisitionStorage.save(updatedRequisitions);
        showToast('Request deleted', 'info');
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
        showToast('Request created', 'success');
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
        <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-slate-800">Requisition Book</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">All Requisitions</h2>
                    <div className="flex space-x-2 items-center">
                         <StyledSelect
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </StyledSelect>
                        <StyledSelect
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as RequisitionStatus | '')}
                        >
                            <option value="">All Statuses</option>
                            {Object.values(RequisitionStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </StyledSelect>
                        {user && (user.role === 'admin' || user.role === 'subordinate') && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 flex items-center whitespace-nowrap">
                                <i className="fas fa-plus mr-2"></i>Create Requisition
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Req. ID</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Date Requested</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 rounded-r-lg text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequisitions.map(req => (
                                <tr key={req.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono">{req.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{req.departmentName}</td>
                                    <td className="px-6 py-4">{new Date(req.dateRequested).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <ul className="space-y-1">
                                            {req.requestedItems.map(item => (
                                                <li key={item.itemId}>{item.itemName} <span className="text-xs text-slate-400">(Qty: {item.quantity})</span></li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                            req.status === RequisitionStatus.PENDING ? 'bg-amber-100 text-amber-800' :
                                            req.status === RequisitionStatus.FORWARDED ? 'bg-sky-100 text-sky-800' :
                                            req.status === RequisitionStatus.ISSUED ? 'bg-emerald-100 text-emerald-800' :
                                            req.status === RequisitionStatus.CANCELLED ? 'bg-slate-100 text-slate-800' : ''
                                          }`}>{req.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            {user?.role === 'admin' && (
                                                <>
                                                    {req.status === RequisitionStatus.PENDING && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleEditClick(req)}
                                                                className="text-slate-500 hover:text-sky-600 p-2"
                                                                title="Edit Requisition"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleForward(req.id)}
                                                                className="bg-sky-500 text-white px-3 py-1 rounded text-xs hover:bg-sky-600"
                                                            >
                                                                Forward
                                                            </button>
                                                        </>
                                                    )}
                                                    {req.status === RequisitionStatus.FORWARDED && (
                                                        <button 
                                                            onClick={() => navigate(`/store-issuing-voucher/${req.id}`)}
                                                            className="bg-emerald-500 text-white px-3 py-1 rounded text-xs hover:bg-emerald-600"
                                                        >
                                                            Process
                                                        </button>
                                                    )}
                                                    {(req.status === RequisitionStatus.PENDING || req.status === RequisitionStatus.FORWARDED) && (
                                                        <button
                                                            onClick={() => handleCancel(req.id)}
                                                            className="bg-slate-500 text-white px-3 py-1 rounded text-xs hover:bg-slate-600"
                                                            title="Cancel Requisition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(req.id)} 
                                                        className="text-slate-500 hover:text-red-600 p-2"
                                                        title="Delete Requisition"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </>
                                            )}
                                             {user?.role !== 'admin' && <span className="text-xs text-slate-400">Admin only</span>}
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