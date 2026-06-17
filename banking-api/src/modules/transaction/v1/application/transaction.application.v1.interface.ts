import { PaginatedResponse, PaginationOptions } from '@/common/types/pagination';
import { Amount } from '@/common/types/money';
import {
  FilterOptions,
  TransactionType,
  UpdateTransactionInput,
} from '@/modules/transaction/types/transaction';
import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';

export interface CreateTransactionInput {
  type: TransactionType;
  amount: Amount;
  idempotencyKey: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  description?: string;
}

export interface TransactionApplicationService {
  findTransactions(
    pagination: PaginationOptions,
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ): Promise<PaginatedResponse<Transaction>>;

  getTransactionById(transactionId: string, userId: string, isAdmin: boolean): Promise<Transaction>;

  updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
    userId: string,
    isAdmin: boolean,
  ): Promise<Transaction>;

  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
}
