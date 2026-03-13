import path from 'path';

import { DataSource } from 'typeorm';

import environmentConfig, { isProduction } from './environment';

import { findFiles } from '../utils/file-loader';

const migrationsPath = path.join(
  isProduction ? 'dist' : 'src',
  'common',
  'databases',
  'migrations',
  `*.${isProduction ? 'js' : 'ts'}`,
);

/**
 * The main data source instance used by the application. It is initialized with
 * the configuration for the database connection and the paths to the entities,
 * migrations, and subscribers.
 *
 * synchronize is intentionally disabled — use migrations to manage schema changes.
 * Run `pnpm migration:run` to apply pending migrations on a fresh database.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: environmentConfig.database.host,
  port: environmentConfig.database.port,
  database: environmentConfig.database.name,
  username: environmentConfig.database.user,
  password: environmentConfig.database.password,
  logging: true,
  synchronize: false,
  entities: findFiles('entity'),
  migrations: [migrationsPath],
  subscribers: findFiles('subscriber'),
});
