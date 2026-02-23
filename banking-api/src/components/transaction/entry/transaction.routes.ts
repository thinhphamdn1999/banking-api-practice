import { Router } from 'express';
import { TransactionRepository } from '../domain/repository/transaction.repository';
import { BankAccountRepository } from '@/components/bank-account/domain/repository/bank-account-repository';
import { TransactionService } from '../domain/services/transaction.service';
import { TransactionController } from './transaction.controller';
import { getDataSource } from '@/common/configs/db';

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
transactionRouter.post('/', controller.createTransaction);
transactionRouter.put('/:id', controller.updateTransaction);

export default transactionRouter;
