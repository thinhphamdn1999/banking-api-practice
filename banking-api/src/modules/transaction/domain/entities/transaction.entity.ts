import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { TransactionStatus, TransactionType } from '@/modules/transaction/types/transaction';

import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';

@Entity({ name: 'Transaction' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 20, default: TransactionType.DEPOSIT })
  type!: TransactionType;

  @Column({ type: 'varchar', length: 20, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: '0.0' })
  amount!: string;

  @Column({ type: 'varchar', length: 20, default: 'USD' })
  currency!: string;

  @Column({ type: 'text', unique: true })
  idempotencyKey!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => BankAccount, { nullable: true })
  fromAccount!: BankAccount;

  @ManyToOne(() => BankAccount, { nullable: true })
  toAccount!: BankAccount;
}
