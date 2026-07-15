import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';
import { User } from '@/modules/user/domain/entities/user.entity';

import { PaymentProvider, PaymentStatus, PaymentType } from '@/modules/payment/types/payment';

@Entity({ name: 'Payment' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.TRANSFER })
  type!: PaymentType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 20, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason!: string;

  @Column({ type: 'enum', enum: PaymentProvider, default: PaymentProvider.INTERNAL })
  provider!: PaymentProvider;

  @Column({ type: 'text', nullable: true })
  providerRef!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, { nullable: false })
  user!: User;

  @ManyToOne(() => BankAccount, { nullable: true })
  fromAccount!: BankAccount;

  @ManyToOne(() => BankAccount, { nullable: true })
  toAccount!: BankAccount;
}
