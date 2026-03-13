import { DataSource } from 'typeorm';

import { User } from '@/modules/user/domain/entities/user.entity';
import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';
import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';
import environmentConfig from '../environment';

/**
 * The test data source instance used for testing. It is configured to use a PostgreSQL database, which ensures tests run against the same database engine as production. The entities are explicitly listed to ensure that only the relevant entities are included in the test database schema.
 */
export const TestDataSource = new DataSource({
  type: 'postgres',
  host: environmentConfig.database.host,
  port: Number(environmentConfig.database.port),
  database: environmentConfig.database.testName,
  username: environmentConfig.database.user,
  password: environmentConfig.database.password,
  synchronize: true,
  logging: false,
  entities: [User, BankAccount, Transaction],
});
