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
import { useUI } from './ui/UIContext';

const StoreIssuingVoucher: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [requisition, setRequisition] = useState<Requisition | null>(null);
    const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
    const [stockItems, setStockItems] = useState<Item[]>([]);
    const { showToast, confirm } = useUI();

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
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget; // capture before any await to avoid React event pooling issues
        if (!requisition) {
            showToast('Requisition not found', 'error');
            return;
        }

        try {
        const ok = await confirm('Issue the selected quantities and create the voucher?', { title: 'Confirm Issue', confirmText: 'Issue Items', cancelText: 'Go Back' });
            if (!ok) return;

        // Build a full list of requested items merged with the current issued quantities.
        const mergedItems = requisition.requestedItems.map(reqItem => {
            const stockItem = stockItems.find(stock => stock.id === reqItem.itemId);
            const stateItem = issuedItems.find(item => item.itemId === reqItem.itemId);
            const availableStock = stockItem?.quantity ?? 0;
            const requestedQty = reqItem.quantity;
            const issuedQty = Math.max(
                0,
                Math.min(stateItem?.issuedQty ?? 0, requestedQty, availableStock)
            );
            return {
                itemId: reqItem.itemId,
                itemName: reqItem.itemName,
                requestedQty,
                issuedQty,
                balance: availableStock - issuedQty,
            };
        });

        const anyIssued = mergedItems.some(i => i.issuedQty > 0);
            if (!anyIssued) {
                const proceed = await confirm('No items are being issued. Create a pending voucher?', { title: 'Confirm', confirmText: 'Create Pending Voucher', cancelText: 'Cancel' });
                if (!proceed) return;
            }

            // 1. Update stock quantities (only if items are being issued)
        const updatedStockItems = stockItems.map(stock => {
            const issuedDetail = mergedItems.find(item => item.itemId === stock.id);
            if (!issuedDetail || issuedDetail.issuedQty <= 0) {
                return stock;
            }
            return { ...stock, quantity: Math.max(0, stock.quantity - issuedDetail.issuedQty) };
        });
        if (anyIssued) {
            itemStorage.save(updatedStockItems);
        }

            // 2. Update requisition status (only mark as ISSUED if items were actually issued)
            const allRequisitions = requisitionStorage.get();
            const updatedRequisitions = allRequisitions.map(req => {
                if (req.id === requisition.id) {
                    // Only mark as ISSUED if items were actually issued
                    // Otherwise keep current status (FORWARDED) for pending vouchers
                    return anyIssued 
                        ? { ...req, status: RequisitionStatus.ISSUED }
                        : req;
                }
                return req;
            });
            requisitionStorage.save(updatedRequisitions);

            // 3. Upsert issued item record (update existing pending or create new)
            const allIssuedRecords = issuedRecordStorage.get();
            const existingIndex = allIssuedRecords.findIndex(r => r.requisitionId === requisition.id);
        const allFullyIssued = mergedItems.length > 0 && mergedItems.every(i => i.issuedQty === i.requestedQty && i.issuedQty > 0);
        const anyPartial = mergedItems.some(i => i.issuedQty > 0 && i.issuedQty < i.requestedQty);

        // Save ALL items so the voucher details show everything requested with the post-issue balance.
        const itemsWithBalance = mergedItems.map(item => {
            const stockItem = updatedStockItems.find(s => s.id === item.itemId) ?? stockItems.find(s => s.id === item.itemId);
            return {
                ...item,
                balance: Math.max(0, stockItem?.quantity ?? item.balance ?? 0),
            };
        });

            const formData = new FormData(formEl);
            const notesValue = (formData.get('notes') ?? '').toString();

            const baseRecord: IssuedItemRecord = {
                id: existingIndex > -1 ? allIssuedRecords[existingIndex].id : (allIssuedRecords.length > 0 ? Math.max(...allIssuedRecords.map(r => r.id)) + 1 : 201),
                requisitionId: requisition.id,
                voucherId: `SIV-${new Date().getFullYear()}-${String(requisition.id).padStart(3, '0')}`,
                departmentName: requisition.departmentName,
                issueDate: new Date().toISOString().split('T')[0],
                notes: notesValue,
                status: allFullyIssued ? IssuedItemStatus.ISSUED : (anyPartial || anyIssued ? IssuedItemStatus.PARTIALLY_ISSUED : IssuedItemStatus.PENDING),
                issuedItems: itemsWithBalance,
            };

            if (existingIndex > -1) {
                const updated = [...allIssuedRecords];
                updated[existingIndex] = baseRecord;
                issuedRecordStorage.save(updated);
            } else {
                issuedRecordStorage.save([...allIssuedRecords, baseRecord]);
            }

            showToast('Items issued successfully', 'success');
            const highlightId = baseRecord.id;
            try { 
                sessionStorage.setItem('issued_highlight_id', String(highlightId)); 
            } catch (err) {
                console.warn('Could not save highlight ID to sessionStorage:', err);
            }
            navigate('/issued-items-record', { state: { highlightId }, replace: true });
        } catch (error) {
            console.error('Error creating voucher:', error);
            showToast('Failed to create voucher. Please try again.', 'error');
        }
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
