
export enum ItemCategory {
  CONSUMABLES = 'CON',
  STATIONERY = 'STA',
  LAB_ITEMS = 'LAB',
  SURGICAL_ITEMS = 'SUR',
  DETERGENTS = 'DET',
  SANITARY = 'SAN',
  GENERAL_ITEMS = 'GEN',
}

export const ItemCategoryLabels: { [key in ItemCategory]: string } = {
  [ItemCategory.CONSUMABLES]: 'Consumables',
  [ItemCategory.STATIONERY]: 'Stationery',
  [ItemCategory.LAB_ITEMS]: 'Lab Items',
  [ItemCategory.SURGICAL_ITEMS]: 'Surgical Items',
  [ItemCategory.DETERGENTS]: 'Detergents',
  [ItemCategory.SANITARY]: 'Sanitary',
  [ItemCategory.GENERAL_ITEMS]: 'General Items',
};

export const ItemCategoryKeysByLabel: { [key: string]: ItemCategory } = 
    Object.entries(ItemCategoryLabels).reduce((acc, [key, label]) => {
        acc[label] = key as ItemCategory;
        return acc;
    }, {} as { [key: string]: ItemCategory });

export interface Item {
  id: number;
  itemName: string;
  itemCode: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  dateReceived: string;
  supplier: string;
}

export interface RequestedItem {
  itemId: number;
  itemName: string;
  quantity: number;
}

export enum RequisitionStatus {
  PENDING = 'Pending',
  FORWARDED = 'Forwarded',
  ISSUED = 'Issued',
  CANCELLED = 'Cancelled',
}

export interface Requisition {
  id: number;
  departmentName: string;
  requestedItems: RequestedItem[];
  dateRequested: string;
  status: RequisitionStatus;
  createdBy: number;
}

export interface IssuedItem {
    itemId: number;
    itemName: string;
    requestedQty: number;
    issuedQty: number;
    balance: number;
}

export interface StoreIssuingVoucher {
    id: number;
    requisitionId: number;
    voucherId: string;
    departmentName: string;
    issuedItems: IssuedItem[];
    issueDate: string;
    notes: string;
}

export enum IssuedItemStatus {
    PENDING = 'Pending',
    PARTIALLY_ISSUED = 'Partially Issued',
    ISSUED = 'Issued',
}

export interface IssuedItemRecord extends StoreIssuingVoucher {
    status: IssuedItemStatus;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'subordinate';
  password?: string; // For mock authentication only
}

export interface PurchaseOrderItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string; // It's received when this is set
  items: PurchaseOrderItem[];
  status: 'Pending' | 'Received' | 'Cancelled';
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}
