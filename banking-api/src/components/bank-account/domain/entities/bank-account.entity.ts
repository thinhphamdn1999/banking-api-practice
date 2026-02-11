import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Transaction } from '@/components/transaction/domain/entities/transaction.entity';
import { User } from '@/components/user/domain/entities/user.entity';

@Entity({ name: 'BankAccount' })
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  accountNumber!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance!: number;

  @ManyToOne(() => User, (user) => user.bankAccounts)
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.fromAccount)
  outgoingTransactions!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.toAccount)
  incomingTransactions!: Transaction[];
}
