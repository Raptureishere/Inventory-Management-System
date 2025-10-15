

import { Item, ItemCategory, Requisition, RequisitionStatus, IssuedItemRecord, IssuedItemStatus, User, PurchaseOrder, Supplier } from './types';

export const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'sub', password: 'sub123', role: 'subordinate' },
];

export const DEPARTMENTS = ['Ward A', 'Laboratory', 'Pharmacy', 'ICU', 'Pediatrics'];

export const MOCK_ITEMS: Item[] = [
  { id: 1, itemName: 'A4 Paper Ream', itemCode: 'SL001', category: ItemCategory.STATIONERY, quantity: 50, unit: 'reams', dateReceived: '2023-10-01', supplier: 'Office Supplies Inc.' },
  { id: 2, itemName: 'Hand Sanitizer 500ml', itemCode: 'SM001', category: ItemCategory.SANITARY, quantity: 120, unit: 'bottles', dateReceived: '2023-10-02', supplier: 'HealthPro' },
  { id: 3, itemName: 'Disposable Gloves', itemCode: 'CL001', category: ItemCategory.CONSUMABLES, quantity: 8, unit: 'boxes', dateReceived: '2023-10-03', supplier: 'MediCare' },
  { id: 4, itemName: 'Microscope Slides', itemCode: 'LG001', category: ItemCategory.LABORATORY, quantity: 200, unit: 'packs', dateReceived: '2023-10-04', supplier: 'LabEquip' },
  { id: 5, itemName: 'Bleach 1L', itemCode: 'A2001', category: ItemCategory.DETERGENTS, quantity: 75, unit: 'bottles', dateReceived: '2023-10-05', supplier: 'CleanCo' },
  { id: 6, itemName: 'Ballpoint Pens', itemCode: 'SL002', category: ItemCategory.STATIONERY, quantity: 5, unit: 'boxes', dateReceived: '2023-10-06', supplier: 'Office Supplies Inc.' },
  { id: 7, itemName: 'Surgical Masks', itemCode: 'CL002', category: ItemCategory.CONSUMABLES, quantity: 500, unit: 'boxes', dateReceived: '2023-10-07', supplier: 'MediCare' },
  { id: 8, itemName: 'Test Tubes', itemCode: 'LG002', category: ItemCategory.LABORATORY, quantity: 9, unit: 'packs', dateReceived: '2023-10-08', supplier: 'LabEquip' },
];

export const MOCK_REQUISITIONS: Requisition[] = [
  {
    id: 101, departmentName: 'Laboratory', dateRequested: '2023-10-15T10:00:00Z', status: RequisitionStatus.FORWARDED, createdBy: 1,
    requestedItems: [
      { itemId: 4, itemName: 'Microscope Slides', quantity: 10 },
      { itemId: 8, itemName: 'Test Tubes', quantity: 5 },
    ]
  },
  {
    id: 102, departmentName: 'Ward A', dateRequested: '2023-10-16T11:30:00Z', status: RequisitionStatus.PENDING, createdBy: 2,
    requestedItems: [
      { itemId: 2, itemName: 'Hand Sanitizer 500ml', quantity: 20 },
      { itemId: 3, itemName: 'Disposable Gloves', quantity: 10 },
      { itemId: 7, itemName: 'Surgical Masks', quantity: 5 },
    ]
  },
  {
    id: 103, departmentName: 'Pharmacy', dateRequested: '2023-10-17T09:00:00Z', status: RequisitionStatus.PENDING, createdBy: 1,
    requestedItems: [
      { itemId: 3, itemName: 'Disposable Gloves', quantity: 15 },
    ]
  },
  {
    id: 104, departmentName: 'ICU', dateRequested: '2023-10-18T14:00:00Z', status: RequisitionStatus.ISSUED, createdBy: 1,
    requestedItems: [
        { itemId: 7, itemName: 'Surgical Masks', quantity: 50 },
    ]
  },
];


export const MOCK_ISSUED_RECORDS: IssuedItemRecord[] = [
    {
        id: 201, requisitionId: 104, voucherId: 'SIV-2023-001', departmentName: 'ICU',
        issueDate: '2023-10-19', notes: 'Urgent request fulfilled.', status: IssuedItemStatus.FULLY_PROVIDED,
        issuedItems: [
            { itemId: 7, itemName: 'Surgical Masks', requestedQty: 50, issuedQty: 50, balance: 450 }
        ]
    }
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2023-001',
    supplierName: 'Office Supplies Inc.',
    orderDate: '2023-09-15',
    expectedDeliveryDate: '2023-09-30',
    receivedDate: '2023-10-01',
    status: 'Received',
    items: [
      { itemId: 1, itemName: 'A4 Paper Ream', quantity: 50, unitPrice: 5.00 },
      { itemId: 6, itemName: 'Ballpoint Pens', quantity: 5, unitPrice: 10.00 },
    ],
  },
  {
    id: 2,
    poNumber: 'PO-2023-002',
    supplierName: 'MediCare',
    orderDate: '2023-09-20',
    expectedDeliveryDate: '2023-10-05',
    receivedDate: '2023-10-07',
    status: 'Received',
    items: [
      { itemId: 3, itemName: 'Disposable Gloves', quantity: 8, unitPrice: 15.00 },
      { itemId: 7, itemName: 'Surgical Masks', quantity: 500, unitPrice: 20.00 },
    ],
  },
    {
    id: 3,
    poNumber: 'PO-2023-003',
    supplierName: 'LabEquip',
    orderDate: '2023-10-10',
    expectedDeliveryDate: '2023-10-25',
    status: 'Pending',
    items: [
      { itemId: 4, itemName: 'Microscope Slides', quantity: 100, unitPrice: 8.00 },
    ],
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 1, name: 'Office Supplies Inc.', contactName: 'Jane Doe', phone: '+1 555-0100', email: 'sales@office-supplies.example', address: '123 Office Park, Suite 100', notes: 'Preferred for stationery' },
  { id: 2, name: 'MediCare', contactName: 'John Smith', phone: '+1 555-0101', email: 'orders@medicare.example', address: '88 Health Ave', notes: 'Consumables vendor' },
  { id: 3, name: 'LabEquip', contactName: 'Mary Lee', phone: '+1 555-0102', email: 'support@labequip.example', address: '45 Science Rd', notes: 'Laboratory equipment and supplies' },
];
