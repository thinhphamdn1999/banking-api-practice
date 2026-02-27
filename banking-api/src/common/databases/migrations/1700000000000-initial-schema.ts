import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "User" (
        "id" varchar PRIMARY KEY NOT NULL,
        "clerkUserId" varchar(255) NOT NULL,
        "email" varchar(255),
        "username" varchar(255),
        "firstName" varchar(150),
        "lastName" varchar(150),
        "avatarUrl" text,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        "deletedAt" datetime,
        "status" varchar(20) NOT NULL DEFAULT ('active'),
        "role" varchar(20) NOT NULL DEFAULT ('user')
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_clerkUserId" ON "User" ("clerkUserId")
    `);

    await queryRunner.query(`
      CREATE TABLE "BankAccount" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "accountNumber" varchar(50) NOT NULL,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        "balance" decimal(15,2) NOT NULL DEFAULT (0),
        "userId" varchar,
        CONSTRAINT "FK_bankAccount_user" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_bankAccount_accountNumber" ON "BankAccount" ("accountNumber")
    `);

    await queryRunner.query(`
      CREATE TABLE "Transaction" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" varchar(255),
        "type" varchar(20) NOT NULL DEFAULT ('deposit'),
        "status" varchar(20) NOT NULL DEFAULT ('pending'),
        "amount" decimal(15,2) NOT NULL DEFAULT (0),
        "currency" varchar(20) NOT NULL DEFAULT ('USD'),
        "idempotencyKey" text NOT NULL,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        "fromAccountId" varchar,
        "toAccountId" varchar,
        CONSTRAINT "FK_transaction_fromAccount" FOREIGN KEY ("fromAccountId") REFERENCES "BankAccount" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_transaction_toAccount" FOREIGN KEY ("toAccountId") REFERENCES "BankAccount" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Transaction"`);
    await queryRunner.query(`DROP TABLE "BankAccount"`);
    await queryRunner.query(`DROP TABLE "User"`);
  }
}
