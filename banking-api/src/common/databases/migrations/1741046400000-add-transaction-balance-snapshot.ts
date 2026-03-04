import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionBalanceSnapshot1741046400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Transaction" ADD COLUMN "fromAccountBalance" DECIMAL(15, 2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Transaction" ADD COLUMN "toAccountBalance" DECIMAL(15, 2) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Transaction" DROP COLUMN "fromAccountBalance"`);
    await queryRunner.query(`ALTER TABLE "Transaction" DROP COLUMN "toAccountBalance"`);
  }
}
