import { DataSource } from 'typeorm';

import { User } from '@/components/user/data-access/user.entity';

export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: 'banking-api-test.sqlite',
  dropSchema: true,
  synchronize: true,
  logging: false,
  entities: [User],
});
