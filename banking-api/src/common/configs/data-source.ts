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
      ? 'dist/components/**/data-access/*.entity.js'
      : 'src/components/**/data-access/*.entity.ts',
  ],

  migrations: [
    isProd ? 'dist/common/database/migrations/*.js' : 'src/common/database/migrations/*.ts',
  ],
  subscribers: ['src/common/database/subscribers/*.{ts,js}'],
});
