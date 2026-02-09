import type { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { TestDataSource } from '@/common/configs/test/test-data-source';

import { setDataSource } from '@/common/configs/db';

export class TestHelper {
  private static _instance: TestHelper;
  private constructor() {}

  public static get instance(): TestHelper {
    if (!this._instance) this._instance = new TestHelper();
    return this._instance;
  }

  getRepo<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
    return TestDataSource.getRepository(target);
  }

  async setupTestDB() {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }

    setDataSource(TestDataSource);
  }

  async teardownTestDB() {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  }
}
