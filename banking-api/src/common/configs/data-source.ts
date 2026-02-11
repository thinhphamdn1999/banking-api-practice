import { DataSource } from 'typeorm';

import env from './env';

const isProd = env.nodeEnv === 'production';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'banking-api.sqlite',
  logging: true,
  synchronize: true,
  entities: [
    isProd
      ? 'dist/components/**/domain/entities/*.entity.js'
      : 'src/components/**/domain/entities/*.entity.ts',
  ],

  migrations: [
    isProd ? 'dist/common/database/migrations/*.js' : 'src/common/database/migrations/*.ts',
  ],
  subscribers: [
    isProd ? 'dist/common/database/subscribers/*.js' : 'src/common/database/subscribers/*.ts',
  ],
});
