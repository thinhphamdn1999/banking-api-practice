import { SortOrder } from '@/common/constants/filter-parameter';

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

export interface UpdateTransactionInput {
  description?: string;
}
