import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { IssuingVoucher } from './IssuingVoucher';
import { Item } from './Item';

@Entity('issuing_items')
export class IssuingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  voucherId: number;

  @ManyToOne(() => IssuingVoucher, voucher => voucher.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucherId' })
  voucher: IssuingVoucher;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, item => item.issuingItems)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ length: 200 })
  itemName: string;

  @Column({ type: 'int' })
  requestedQty: number;

  @Column({ type: 'int', default: 0 })
  issuedQty: number;

  @Column({ type: 'int' })
  balance: number;
}
