import { Order } from '@/common/constants/filters';

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
  bankAccountId?: string[];
}
