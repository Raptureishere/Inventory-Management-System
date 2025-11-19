import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { Supplier } from '../entities/Supplier';
import { Requisition } from '../entities/Requisition';
import { RequisitionItem } from '../entities/RequisitionItem';
import { PurchaseOrder } from '../entities/PurchaseOrder';
import { PurchaseOrderItem } from '../entities/PurchaseOrderItem';
import { IssuingVoucher } from '../entities/IssuingVoucher';
import { IssuingItem } from '../entities/IssuingItem';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Item,
    Supplier,
    Requisition,
    RequisitionItem,
    PurchaseOrder,
    PurchaseOrderItem,
    IssuingVoucher,
    IssuingItem
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
});
