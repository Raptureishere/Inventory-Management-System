import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Requisition } from './Requisition';

export enum UserRole {
  ADMIN = 'admin',
  SUBORDINATE = 'subordinate'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SUBORDINATE
  })
  role: UserRole;

  @Column({ nullable: true, length: 100 })
  fullName: string;

  @Column({ nullable: true, unique: true, length: 100 })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Requisition, requisition => requisition.createdBy)
  requisitions: Requisition[];
}
