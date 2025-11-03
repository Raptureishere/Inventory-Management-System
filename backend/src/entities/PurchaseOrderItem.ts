import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { PurchaseOrder } from './PurchaseOrder';
import { Item } from './Item';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseOrderId: number;

  @ManyToOne(() => PurchaseOrder, po => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, item => item.purchaseOrderItems)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ length: 200 })
  itemName: string;

  @Column({ type: 'int' })
  orderedQty: number;

  @Column({ type: 'int', default: 0 })
  receivedQty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;
}
