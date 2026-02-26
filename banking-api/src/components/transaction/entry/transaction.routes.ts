import { Router } from 'express';

import { getDataSource } from '@/common/configs/db';

import { requireRole } from '@/common/middleware/require-role';

import { UserRole } from '@/components/user/types/user';

import { TransactionRepository } from '@/components/transaction/domain/repository/transaction.repository';
import { BankAccountRepository } from '@/components/bank-account/domain/repository/bank-account.repository';
import { TransactionService } from '@/components/transaction/domain/services/transaction.service';

import { TransactionController } from '@/components/transaction/entry/transaction.controller';

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
