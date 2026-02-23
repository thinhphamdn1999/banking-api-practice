import { Order } from '@/common/constants/filters';
import { Amount } from '@/common/types/currency';

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
  orderBy?: Order;
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
