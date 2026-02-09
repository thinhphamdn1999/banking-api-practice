import type { DataSource } from 'typeorm';
import { AppDataSource } from '@/common/configs/data-source';

let dataSource: DataSource = AppDataSource;

/**
 * Used by data-access/*.repository.ts files
 */
export const getDataSource = (): DataSource => dataSource;

/**
 * Used only by tests (or bootstrapping)
 */
export const setDataSource = (ds: DataSource): void => {
  dataSource = ds;
};
