import { DataSource } from 'typeorm';

import { User } from '@/components/user/domain/entities/user.entity';
import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';
import { Transaction } from '@/components/transaction/domain/entities/transaction.entity';

export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
  logging: false,
  entities: [User, BankAccount, Transaction],
});
