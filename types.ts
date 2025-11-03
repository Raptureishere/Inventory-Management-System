
export enum ItemCategory {
  MEDICAL_SURGICAL = 'MS',
  PHARMACEUTICALS = 'PH',
  LABORATORY = 'LB',
  RADIOLOGY_IMAGING = 'RI',
  HOSPITAL_EQUIPMENT = 'HE',
  NON_MEDICAL_CONSUMABLES = 'NC',
  PPE = 'PP',
  MAINTENANCE_ENGINEERING = 'ME',
  FURNITURE_FIXTURES = 'FF',
  IT_COMMUNICATION = 'IC',
  STERILIZATION_DISINFECTION = 'SD',
  AMBULANCE_EMERGENCY = 'AE',
  LINEN_WARD = 'LW',
  WASTE_MANAGEMENT = 'WM',
}

export const ItemCategoryLabels: { [key in ItemCategory]: string } = {
  [ItemCategory.MEDICAL_SURGICAL]: 'Medical and Surgical Supplies',
  [ItemCategory.PHARMACEUTICALS]: 'Pharmaceuticals',
  [ItemCategory.LABORATORY]: 'Laboratory Supplies',
  [ItemCategory.RADIOLOGY_IMAGING]: 'Radiology and Imaging Supplies',
  [ItemCategory.HOSPITAL_EQUIPMENT]: 'Hospital Equipment',
  [ItemCategory.NON_MEDICAL_CONSUMABLES]: 'Non-Medical Consumables',
  [ItemCategory.PPE]: 'Personal Protective Equipment (PPE)',
  [ItemCategory.MAINTENANCE_ENGINEERING]: 'Maintenance and Engineering Supplies',
  [ItemCategory.FURNITURE_FIXTURES]: 'Furniture and Fixtures',
  [ItemCategory.IT_COMMUNICATION]: 'IT and Communication Equipment',
  [ItemCategory.STERILIZATION_DISINFECTION]: 'Sterilization and Disinfection Materials',
  [ItemCategory.AMBULANCE_EMERGENCY]: 'Ambulance and Emergency Supplies',
  [ItemCategory.LINEN_WARD]: 'Linen and Ward Items',
  [ItemCategory.WASTE_MANAGEMENT]: 'Waste Management Supplies',
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
    PARTIALLY_PROVIDED = 'Partially Provided',
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
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}
