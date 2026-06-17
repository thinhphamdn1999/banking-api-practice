import { Router } from 'express';

import { getDataSource } from '@/common/configs/database';

import { requireRole } from '@/common/middleware/role-guard.middleware';
import { requireIdempotencyKey } from '@/common/middleware/idempotency-key.middleware';

import { UserRole } from '@/modules/user/types/user';

import { TransactionRepository } from '@/modules/transaction/domain/repository/transaction.repository';
import { BankAccountRepository } from '@/modules/bank-account/domain/repository/bank-account.repository';
import { TransactionService } from '@/modules/transaction/domain/services/transaction.service';
import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';
import { TransactionApplicationServiceV1 } from '@/modules/transaction/v1/application/transaction.application.v1';

import { TransactionController } from '@/modules/transaction/v1/entry/transaction.controller';

const transactionRouter = Router();

const transactionRepository = new TransactionRepository();
const bankAccountRepository = new BankAccountRepository();

const transactionService = new TransactionService(transactionRepository);
const bankAccountService = new BankAccountService(bankAccountRepository);

const transactionApplicationService = new TransactionApplicationServiceV1(
  transactionService,
  bankAccountService,
  getDataSource(),
);

const controller = new TransactionController(transactionApplicationService);

transactionRouter.get('/', controller.getTransactions);
transactionRouter.get('/:id', controller.getTransactionById);
transactionRouter.post(
  '/',
  requireRole(UserRole.USER),
  requireIdempotencyKey,
  controller.createTransaction,
);
transactionRouter.put('/:id', requireRole(UserRole.USER), controller.updateTransaction);

export default transactionRouter;
