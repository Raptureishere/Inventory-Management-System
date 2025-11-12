

import { Item, ItemCategory, Requisition, RequisitionStatus, IssuedItemRecord, IssuedItemStatus, User, PurchaseOrder, Supplier } from './types';

export const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'sub', password: 'sub123', role: 'subordinate' },
];

export const DEPARTMENTS = [
  'OPD',
  'Maternity',
  'Emergency',
  'Female ward',
  'ENT',
  'Dental',
  'Laundry',
  'Recovery',
  'Theater',
  'ANC',
  'Scan',
  'DCU',
  'PNC',
  'Dressing',
  'Eye Unit',
  'Administration',
  'Accounts',
  'Procurement',
  'Nursing Administration',
  'Audit',
  'IT',
  'Creche',
  'Estate',
  'Records',
  'Nicu',
  'Pharmacy'
];

export const MOCK_ITEMS: Item[] = [
  { id: 1, itemName: 'Surgical Scalpel Set', itemCode: 'SUR001', category: ItemCategory.SURGICAL_ITEMS, quantity: 50, unit: 'sets', dateReceived: '2023-10-01', supplier: 'MediCare' },
  { id: 2, itemName: 'Paracetamol 500mg', itemCode: 'CON002', category: ItemCategory.CONSUMABLES, quantity: 120, unit: 'bottles', dateReceived: '2023-10-02', supplier: 'PharmaCo' },
  { id: 3, itemName: 'Disposable Gloves', itemCode: 'SUR003', category: ItemCategory.SURGICAL_ITEMS, quantity: 8, unit: 'boxes', dateReceived: '2023-10-03', supplier: 'MediCare' },
  { id: 4, itemName: 'Microscope Slides', itemCode: 'LAB004', category: ItemCategory.LAB_ITEMS, quantity: 200, unit: 'packs', dateReceived: '2023-10-04', supplier: 'LabEquip' },
  { id: 5, itemName: 'Disinfectant Solution 1L', itemCode: 'DET005', category: ItemCategory.DETERGENTS, quantity: 75, unit: 'bottles', dateReceived: '2023-10-05', supplier: 'CleanCo' },
  { id: 6, itemName: 'Patient Bed', itemCode: 'GEN006', category: ItemCategory.GENERAL_ITEMS, quantity: 5, unit: 'units', dateReceived: '2023-10-06', supplier: 'HospitalEquip Inc.' },
  { id: 7, itemName: 'Surgical Masks', itemCode: 'SUR007', category: ItemCategory.SURGICAL_ITEMS, quantity: 500, unit: 'boxes', dateReceived: '2023-10-07', supplier: 'MediCare' },
  { id: 8, itemName: 'Test Tubes', itemCode: 'LAB008', category: ItemCategory.LAB_ITEMS, quantity: 9, unit: 'packs', dateReceived: '2023-10-08', supplier: 'LabEquip' },
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
        issueDate: '2023-10-19', notes: 'Urgent request fulfilled.', status: IssuedItemStatus.ISSUED,
        issuedItems: [
            { itemId: 7, itemName: 'Surgical Masks', requestedQty: 50, issuedQty: 50, balance: 450 }
        ]
    }
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2023-001',
    supplierName: 'MediCare',
    orderDate: '2023-09-15',
    expectedDeliveryDate: '2023-09-30',
    receivedDate: '2023-10-01',
    status: 'Received',
    items: [
      { itemId: 1, itemName: 'Surgical Scalpel Set', quantity: 50, unitPrice: 25.00 },
      { itemId: 6, itemName: 'Patient Bed', quantity: 5, unitPrice: 500.00 },
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
  { id: 1, name: 'MediCare', contactPerson: 'John Smith', phone: '+1 555-0100', email: 'orders@medicare.example', address: '88 Health Ave', notes: 'Medical and surgical supplies, PPE' },
  { id: 2, name: 'PharmaCo', contactPerson: 'Jane Doe', phone: '+1 555-0101', email: 'sales@pharmaco.example', address: '123 Pharma Plaza', notes: 'Pharmaceuticals and medications' },
  { id: 3, name: 'LabEquip', contactPerson: 'Mary Lee', phone: '+1 555-0102', email: 'support@labequip.example', address: '45 Science Rd', notes: 'Laboratory equipment and supplies' },
  { id: 4, name: 'CleanCo', contactPerson: 'Robert Brown', phone: '+1 555-0103', email: 'info@cleanco.example', address: '67 Industrial Way', notes: 'Sterilization and disinfection materials' },
  { id: 5, name: 'HospitalEquip Inc.', contactPerson: 'Sarah Johnson', phone: '+1 555-0104', email: 'sales@hospitalequip.example', address: '90 Medical Drive', notes: 'Hospital equipment and furniture' },
];
