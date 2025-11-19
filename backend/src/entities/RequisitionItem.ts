import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Requisition } from './Requisition';
import { Item } from './Item';

@Entity('requisition_items')
export class RequisitionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requisitionId: number;

  @ManyToOne(() => Requisition, requisition => requisition.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisitionId' })
  requisition: Requisition;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, item => item.requisitionItems)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ type: 'int' })
  requestedQty: number;

  @Column({ length: 200 })
  itemName: string;
}
