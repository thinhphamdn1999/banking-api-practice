import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { UserRole, UserStatus } from '@/modules/user/types/user';

import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  clerkUserId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  lastName!: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;

  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'varchar', length: 20, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.user)
  bankAccounts!: BankAccount[];
}
