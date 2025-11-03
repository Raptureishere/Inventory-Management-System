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
import { RequisitionItem } from './RequisitionItem';
import { PurchaseOrderItem } from './PurchaseOrderItem';
import { IssuingItem } from './IssuingItem';

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
  WASTE_MANAGEMENT = 'WM'
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  itemCode: string;

  @Column({ length: 200 })
  itemName: string;

  @Column({
    type: 'enum',
    enum: ItemCategory
  })
  category: ItemCategory;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'date' })
  dateReceived: Date;

  @Column({ nullable: true })
  supplierId: number;

  @ManyToOne(() => Supplier, supplier => supplier.items, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 10 })
  reorderLevel: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RequisitionItem, reqItem => reqItem.item)
  requisitionItems: RequisitionItem[];

  @OneToMany(() => PurchaseOrderItem, poItem => poItem.item)
  purchaseOrderItems: PurchaseOrderItem[];

  @OneToMany(() => IssuingItem, issItem => issItem.item)
  issuingItems: IssuingItem[];
}
