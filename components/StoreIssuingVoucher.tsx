import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requisitionStorage, itemStorage, issuedRecordStorage } from '../services/storageService';
import { 
    Requisition, 
    IssuedItem, 
    Item, 
    RequisitionStatus, 
    IssuedItemRecord, 
    IssuedItemStatus 
} from '../types';

const StoreIssuingVoucher: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [requisition, setRequisition] = useState<Requisition | null>(null);
    const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
    const [stockItems, setStockItems] = useState<Item[]>([]);

    useEffect(() => {
        const reqId = parseInt(id || '0');
        const allRequisitions = requisitionStorage.get();
        const foundRequisition = allRequisitions.find(r => r.id === reqId);
        const allItems = itemStorage.get();
        setStockItems(allItems);

        if (foundRequisition) {
            setRequisition(foundRequisition);
            const itemsToIssue = foundRequisition.requestedItems.map(reqItem => {
                const stockItem = allItems.find(stock => stock.id === reqItem.itemId);
                return {
                    itemId: reqItem.itemId,
                    itemName: reqItem.itemName,
                    requestedQty: reqItem.quantity,
                    issuedQty: 0, // Default to 0, let the admin decide
                    balance: stockItem?.quantity || 0,
                };
            });
            setIssuedItems(itemsToIssue);
        } else {
            // Handle not found case
            navigate('/requisition-book');
        }
    }, [id, navigate]);

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
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!requisition) return;

        // 1. Update stock quantities
        const updatedStockItems = [...stockItems];
        issuedItems.forEach(issuedItem => {
            const stockItemIndex = updatedStockItems.findIndex(stock => stock.id === issuedItem.itemId);
            if (stockItemIndex > -1) {
                updatedStockItems[stockItemIndex].quantity -= issuedItem.issuedQty;
            }
        });
        itemStorage.save(updatedStockItems);

        // 2. Update requisition status
        const allRequisitions = requisitionStorage.get();
        const updatedRequisitions = allRequisitions.map(req => 
            req.id === requisition.id ? { ...req, status: RequisitionStatus.ISSUED } : req
        );
        requisitionStorage.save(updatedRequisitions);

        // 3. Create a new issued item record
        const allIssuedRecords = issuedRecordStorage.get();
        const newRecordId = allIssuedRecords.length > 0 ? Math.max(...allIssuedRecords.map(r => r.id)) + 1 : 201;
        const newRecord: IssuedItemRecord = {
            id: newRecordId,
            requisitionId: requisition.id,
            voucherId: `SIV-${new Date().getFullYear()}-${String(requisition.id).padStart(3, '0')}`,
            departmentName: requisition.departmentName,
            issueDate: new Date().toISOString().split('T')[0],
            notes: (e.currentTarget.elements.namedItem('notes') as HTMLTextAreaElement).value,
            status: IssuedItemStatus.FULLY_PROVIDED, // Could be enhanced to check for partial issues
            issuedItems: issuedItems
                .filter(item => item.issuedQty > 0)
                .map(item => ({
                    ...item,
                    balance: (stockItems.find(si => si.id === item.itemId)?.quantity || 0) - item.issuedQty,
            })),
        };
        issuedRecordStorage.save([...allIssuedRecords, newRecord]);

        alert('Items issued successfully!');
        navigate('/issued-items-record');
    };

    if (!requisition) {
        return <div>Loading...</div>;
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
