import React, { useState, useMemo, useRef } from 'react';
import { DEPARTMENTS } from '../constants';
import { issuedRecordStorage } from '../services/storageService';
import { IssuedItemRecord, IssuedItemStatus } from '../types';
import { useUI } from './ui/UIContext';

const IssuedRecordDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    record: IssuedItemRecord | null;
}> = ({ isOpen, onClose, record }) => {
    const printContentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = printContentRef.current;
        if (!content) return;

        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Voucher</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: Arial, sans-serif; font-size: 14px; }
                    .print-header { text-align: center; margin-bottom: 2rem; }
                    .print-header h1 { margin: 0; }
                    .print-header p { margin: 5px 0; color: #555; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem; }
                    .details-grid div { padding: 4px 0; }
                    .details-grid strong { color: #333; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f7f7f7; }
                    .notes-section { margin-top: 1.5rem; }
                    .notes-section strong { display: block; margin-bottom: 0.5rem; }
                    .notes-content { padding: 10px; background-color: #f7f7f7; border: 1px solid #eee; border-radius: 4px; }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write(content.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl animate-fade-in-up">
                {/* Content to be printed */}
                <div ref={printContentRef}>
                    <div className="print-header">
                         <h1 className="text-2xl font-bold text-gray-800">Store Issuing Voucher</h1>
                         <p>Mother and Child Hospital Inventory System</p>
                    </div>

                    <div className="details-grid">
                        <div><strong>Voucher ID:</strong> <span>{record.voucherId}</span></div>
                        <div><strong>Department:</strong> <span>{record.departmentName}</span></div>
                        <div><strong>Requisition ID:</strong> <span>{record.requisitionId}</span></div>
                        <div><strong>Issue Date:</strong> <span>{record.issueDate}</span></div>
                        <div>
                            <strong>Status:</strong>
                            <span>{record.status}</span>
                        </div>
                    </div>

                    {record.notes && (
                        <div className="notes-section">
                            <strong>Notes:</strong>
                            <div className="notes-content">{record.notes}</div>
                        </div>
                    )}

                    <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Issued Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th style={{ textAlign: 'center' }}>Requested Qty</th>
                                <th style={{ textAlign: 'center' }}>Issued Qty</th>
                                <th style={{ textAlign: 'center' }}>Balance After Issue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.issuedItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.itemName}</td>
                                    <td style={{ textAlign: 'center' }}>{item.requestedQty}</td>
                                    <td style={{ textAlign: 'center' }}>{item.issuedQty}</td>
                                    <td style={{ textAlign: 'center' }}>{item.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* End of content to be printed */}

                <div className="flex justify-end mt-6 no-print">
                     <button onClick={onClose} className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-3">
                        Close
                    </button>
                    <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Print Voucher">
                        <i className="fas fa-print mr-2"></i>Print
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                @media print {
                    .no-print { display: none; }
                }
            `}</style>
        </div>
    );
};


const IssuedItemsRecord: React.FC = () => {
    const [records, setRecords] = useState<IssuedItemRecord[]>(() => issuedRecordStorage.get());
    const [filterDept, setFilterDept] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<IssuedItemRecord | null>(null);
    const { showToast } = useUI();

    const filteredRecords = useMemo(() => {
        return records
            .filter(rec => filterDept ? rec.departmentName === filterDept : true)
            .sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }, [records, filterDept]);

    const handleMarkProvided = (recordId: number) => {
        const updatedRecords = records.map(rec => 
            rec.id === recordId ? { ...rec, status: IssuedItemStatus.FULLY_PROVIDED } : rec
        );
        setRecords(updatedRecords);
        issuedRecordStorage.save(updatedRecords);
        showToast('Voucher marked as Fully Provided', 'success');
    };

    const handleViewDetails = (record: IssuedItemRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecord(null);
    };

    return (
        <div>
            <IssuedRecordDetailsModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                record={selectedRecord}
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Issued Items Record</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Completed Vouchers</h2>
                     <select
                        value={filterDept}
                        onChange={e => setFilterDept(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Voucher ID</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Issued Items</th>
                                <th className="px-6 py-3">Issue Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{record.voucherId}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{record.departmentName}</td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside">
                                            {record.issuedItems.map(item => (
                                                <li key={item.itemId}>{item.itemName} (Issued: {item.issuedQty})</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">{record.issueDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            record.status === IssuedItemStatus.PENDING ? 'bg-yellow-200 text-yellow-800' :
                                            record.status === IssuedItemStatus.PARTIALLY_PROVIDED ? 'bg-amber-200 text-amber-900' :
                                            'bg-green-200 text-green-800'
                                        }`}>{record.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleViewDetails(record)}
                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                            title="View Details"
                                            aria-label={`View details for voucher ${record.voucherId}`}
                                        >
                                            <i className="fas fa-eye" aria-hidden="true"></i>
                                        </button>
                                        {record.status === IssuedItemStatus.PENDING && (
                                            <button 
                                                onClick={() => handleMarkProvided(record.id)}
                                                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                            >
                                                Mark as Provided
                                            </button>
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

export default IssuedItemsRecord;