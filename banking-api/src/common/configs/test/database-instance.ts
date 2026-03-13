import type { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { TestDataSource } from '@/common/configs/test/test-data-source';

import { setDataSource } from '@/common/configs/database';

export class TestHelper {
  private static _instance: TestHelper;
  private constructor() {}

  /**
   * Singleton instance of TestHelper. It provides utility methods for setting up and tearing down the test database, as well as getting repositories for entities.
   * The instance is lazily initialized on first access.
   * @returns - The singleton instance of TestHelper.
   */
  public static get instance(): TestHelper {
    if (!this._instance) this._instance = new TestHelper();
    return this._instance;
  }

  /**
   * Gets the repository for the specified entity target using the test data source. This allows tests to interact with the database using TypeORM repositories.
   * @param target - The entity target (class or name) for which to get the repository.
   * @returns - The repository instance for the specified entity target.
   */
  getRepo<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
    return TestDataSource.getRepository(target);
  }

  /**
   * Initializes the test database connection if it is not already initialized, and sets the application's data source to the test data source. This allows tests to run against an isolated test database without affecting the main application database.
   * It should be called before running any tests that require database access.
   * @returns - A promise that resolves when the test database is set up.
   */
  async setupTestDB() {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }

    setDataSource(TestDataSource);
  }

  async clearAllTables() {
    const queryRunner = TestDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.query('TRUNCATE TABLE "Transaction", "BankAccount", "User" CASCADE');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Destroys the test database connection if it is initialized. This should be called after all tests have completed to clean up resources and ensure that the test database connection is properly closed.
   * @returns - A promise that resolves when the test database connection is destroyed.
   */
  async teardownTestDB() {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  }
}
