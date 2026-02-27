import { Router } from 'express';

import { getDataSource } from '@/common/configs/database';

import { requireRole } from '@/common/middleware/role-guard.middleware';

import { UserRole } from '@/modules/user/types/user';

import { TransactionRepository } from '@/modules/transaction/domain/repository/transaction.repository';
import { BankAccountRepository } from '@/modules/bank-account/domain/repository/bank-account.repository';
import { TransactionService } from '@/modules/transaction/domain/services/transaction.service';

import { TransactionController } from '@/modules/transaction/entry/transaction.controller';

const transactionRouter = Router();

const transactionRepository = new TransactionRepository();
const bankAccountRepository = new BankAccountRepository();
const transactionService = new TransactionService(
  transactionRepository,
  bankAccountRepository,
  getDataSource(),
);
const controller = new TransactionController(transactionService);

transactionRouter.get('/', controller.getTransactions);
transactionRouter.get('/:id', controller.getTransactionById);
transactionRouter.post('/', requireRole(UserRole.USER), controller.createTransaction);
transactionRouter.put('/:id', requireRole(UserRole.USER), controller.updateTransaction);

export default transactionRouter;
