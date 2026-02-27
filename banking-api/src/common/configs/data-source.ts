import { DataSource } from 'typeorm';

import { isProduction } from './environment';

import { findFiles } from '../utils/file-loader';

/**
 * The main data source instance used by the application. It is initialized with
 * the configuration for the database connection and the paths to the entities,
 * migrations, and subscribers.
 */
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'banking-api.sqlite',
  logging: true,
  synchronize: !isProduction,
  entities: findFiles('entity'),
  migrations: findFiles('migration'),
  subscribers: findFiles('subscriber'),
});
