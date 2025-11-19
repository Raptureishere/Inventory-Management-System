import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne
} from 'typeorm';
import { User } from './User';
import { RequisitionItem } from './RequisitionItem';
import { IssuingVoucher } from './IssuingVoucher';

export enum RequisitionStatus {
  PENDING = 'pending',
  FORWARDED = 'forwarded',
  ISSUED = 'issued',
  CANCELLED = 'cancelled'
}

@Entity('requisitions')
export class Requisition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  departmentName: string;

  @Column({
    type: 'enum',
    enum: RequisitionStatus,
    default: RequisitionStatus.PENDING
  })
  status: RequisitionStatus;

  @Column({ type: 'date' })
  requisitionDate: Date;

  @Column({ nullable: true })
  createdById: number;

  @ManyToOne(() => User, user => user.requisitions, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RequisitionItem, reqItem => reqItem.requisition, { cascade: true })
  items: RequisitionItem[];

  @OneToOne(() => IssuingVoucher, voucher => voucher.requisition)
  issuingVoucher: IssuingVoucher;
}
