import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Requisition } from './Requisition';
import { IssuingItem } from './IssuingItem';

export enum VoucherStatus {
  PENDING = 'pending',
  PARTIALLY_PROVIDED = 'partially_provided',
  FULLY_PROVIDED = 'fully_provided'
}

@Entity('issuing_vouchers')
export class IssuingVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  voucherId: string;

  @Column()
  requisitionId: number;

  @OneToOne(() => Requisition, requisition => requisition.issuingVoucher)
  @JoinColumn({ name: 'requisitionId' })
  requisition: Requisition;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.PENDING
  })
  status: VoucherStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => IssuingItem, issItem => issItem.voucher, { cascade: true })
  items: IssuingItem[];
}
