import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { TransactionStatus, TransactionType } from '@/components/transaction/types/transaction';

import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';

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

  @Column({ type: 'text' })
  idempotencyKey!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => BankAccount)
  fromAccount!: BankAccount;

  @ManyToOne(() => BankAccount)
  toAccount!: BankAccount;
}
