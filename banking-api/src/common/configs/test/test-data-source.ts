import { DataSource } from 'typeorm';

import { User } from '@/components/user/domain/entities/user.entity';
import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';
import { Transaction } from '@/components/transaction/domain/entities/transaction.entity';

/**
 * The test data source instance used for testing. It is configured to use an in-memory SQLite database, which allows for fast and isolated tests without affecting the main application database. The entities are explicitly listed to ensure that only the relevant entities are included in the test database schema.
 */
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
  logging: false,
  entities: [User, BankAccount, Transaction],
});
