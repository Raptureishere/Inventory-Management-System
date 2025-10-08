export enum ItemCategory {
  STATIONERY = 'SL',
  SANITARY = 'SM',
  CONSUMABLES = 'CL',
  LABORATORY = 'LG',
  DETERGENTS = 'A2',
}

export const ItemCategoryLabels: { [key in ItemCategory]: string } = {
  [ItemCategory.STATIONERY]: 'Stationery',
  [ItemCategory.SANITARY]: 'Sanitary',
  [ItemCategory.CONSUMABLES]: 'Consumables',
  [ItemCategory.LABORATORY]: 'Laboratory',
  [ItemCategory.DETERGENTS]: 'Detergents',
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
    FULLY_PROVIDED = 'Fully Provided',
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