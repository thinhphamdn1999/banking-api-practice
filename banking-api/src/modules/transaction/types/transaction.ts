import { SortOrder } from '@/common/constants/filter-parameter';
import { Amount } from '@/common/types/money';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
  orderBy?: SortOrder;
  sortBy?: string;
  bankAccountIds?: string[];
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: Amount;
  idempotencyKey: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  description?: string;
}

export interface UpdateTransactionInput {
  description?: string;
}
