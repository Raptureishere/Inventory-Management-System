import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Supplier } from './Supplier';
import { PurchaseOrderItem } from './PurchaseOrderItem';

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  poNumber: string;

  @Column()
  supplierId: number;

  @ManyToOne(() => Supplier, supplier => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date' })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING
  })
  status: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PurchaseOrderItem, poItem => poItem.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];
}
