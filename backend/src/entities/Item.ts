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
  CONSUMABLES = 'CON',
  STATIONERY = 'STA',
  LAB_ITEMS = 'LAB',
  SURGICAL_ITEMS = 'SUR',
  DETERGENTS = 'DET',
  SANITARY = 'SAN',
  GENERAL_ITEMS = 'GEN',
  // Legacy values present in existing databases
  MEDICAL_SURGICAL_LEGACY = 'MS',
  PHARMACEUTICALS_LEGACY = 'PH',
  PPE_LEGACY = 'PPE',
  LABORATORY_LEGACY = 'LB',
  STERILIZATION_DISINFECTION_LEGACY = 'SD',
  HOSPITAL_EQUIPMENT_LEGACY = 'HE'
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  itemCode: string;

  @Column({ length: 200 })
  itemName: string;

  @Column({ type: 'varchar', length: 12 })
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
