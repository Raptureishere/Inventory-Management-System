import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemStorage } from '../services/storageService'; // Keeping itemStorage for now for item list/stock reference
import { api } from '../services/api';
import {
    Requisition,
    IssuedItem,
    Item,
    RequisitionStatus
} from '../types';
import { useUI } from './ui/UIContext';

const StoreIssuingVoucher: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [requisition, setRequisition] = useState<Requisition | null>(null);
    const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
    const [stockItems, setStockItems] = useState<Item[]>([]);
    const { showToast, confirm } = useUI();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch requisition from API
                const reqData = await api.getRequisitionById(parseInt(id));
                setRequisition(reqData);

                // Fetch items (using local storage for now as cache, or could use API)
                // Ideally we should fetch latest stock from API to ensure accuracy
                // const itemsData = await api.getItems({ limit: 1000 }); 
                // setStockItems(itemsData.items || []); 
                // For now, sticking to itemStorage to match existing pattern, but backend will validate stock.
                const allItems = itemStorage.get();
                setStockItems(allItems);

                if (reqData) {
                    const itemsToIssue = reqData.requestedItems.map((reqItem: any) => {
                        const stockItem = allItems.find(stock => stock.id === reqItem.itemId);
                        return {
                            itemId: reqItem.itemId,
                            itemName: reqItem.itemName,
                            requestedQty: reqItem.quantity, // API returns 'quantity' in requestedItems
                            issuedQty: 0,
                            balance: stockItem?.quantity || 0,
                        };
                    });
                    setIssuedItems(itemsToIssue);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                showToast('Failed to load requisition data', 'error');
                navigate('/requisition-book');
            }
        };

        fetchData();
    }, [id, navigate, showToast]);

    const handleIssueQtyChange = (itemId: number, value: number) => {
        setIssuedItems(prevItems =>
            prevItems.map(item => {
                if (item.itemId === itemId) {
                    const availableStock = stockItems.find(i => i.id === itemId)?.quantity || 0;
                    const issuedQty = Math.max(0, Math.min(value, item.requestedQty, availableStock));
                    return { ...item, issuedQty };
                }
                return item;
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget;
        if (!requisition) {
            showToast('Requisition not found', 'error');
            return;
        }

        try {
            const ok = await confirm('Issue the selected quantities and create the voucher?', { title: 'Confirm Issue', confirmText: 'Issue Items', cancelText: 'Go Back' });
            if (!ok) return;

            const formData = new FormData(formEl);
            const notesValue = (formData.get('notes') ?? '').toString();
            const voucherId = `SIV-${new Date().getFullYear()}-${String(requisition.id).padStart(3, '0')}`;

            // Prepare payload for API
            const payload = {
                voucherId,
                requisitionId: requisition.id,
                issueDate: new Date().toISOString().split('T')[0],
                notes: notesValue,
                items: issuedItems.map(item => ({
                    itemId: item.itemId,
                    requestedQty: item.requestedQty,
                    issuedQty: item.issuedQty
                }))
            };

            await api.createIssuingVoucher(payload);

            showToast('Items issued successfully', 'success');

            // Navigate to issued records (or wherever appropriate)
            // We might need to fetch the new voucher ID to highlight it, but for now just navigate
            navigate('/issued-items-record');

        } catch (error) {
            console.error('Error creating voucher:', error);
            showToast('Failed to create voucher. Please try again.', 'error');
        }
    };

    if (!requisition) {
        return <div className="p-6">Loading requisition data...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Store Issuing Voucher</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-4">
                    <div><span className="font-semibold">Requisition ID:</span> {requisition.id}</div>
                    <div><span className="font-semibold">Department:</span> {requisition.departmentName}</div>
                    <div><span className="font-semibold">Date Requested:</span> {new Date(requisition.dateRequested).toLocaleString()}</div>
                    <div><span className="font-semibold">Voucher ID:</span> SIV-{new Date().getFullYear()}-{String(requisition.id).padStart(3, '0')}</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold mb-4">Items to Issue</h2>
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">Requested Qty</th>
                                    <th className="px-6 py-3">Available Stock</th>
                                    <th className="px-6 py-3">Quantity Issued</th>
                                    <th className="px-6 py-3">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issuedItems.map(item => {
                                    const availableStock = stockItems.find(i => i.id === item.itemId)?.quantity || 0;
                                    const isStockInsufficient = availableStock < item.requestedQty;
                                    return (
                                        <tr key={item.itemId} className={`border-b ${isStockInsufficient ? 'bg-yellow-50' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.itemName}</td>
                                            <td className="px-6 py-4">{item.requestedQty}</td>
                                            <td className={`px-6 py-4 font-bold ${availableStock < 10 ? 'text-red-600' : ''}`}>{availableStock}</td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    max={Math.min(item.requestedQty, availableStock)}
                                                    min="0"
                                                    value={item.issuedQty}
                                                    onChange={e => handleIssueQtyChange(item.itemId, parseInt(e.target.value) || 0)}
                                                    className="p-1 border rounded w-20"
                                                />
                                            </td>
                                            <td className="px-6 py-4">{availableStock - item.issuedQty}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="notes" className="block font-semibold mb-1">Notes:</label>
                        <textarea id="notes" name="notes" rows={3} className="w-full p-2 border rounded" placeholder="Add any notes here..."></textarea>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={() => navigate('/requisition-book')} className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Issue Items</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreIssuingVoucher;
