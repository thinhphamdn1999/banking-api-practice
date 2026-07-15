import { SortOrder } from '@/common/constants/filter-parameter';

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export enum PaymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum PaymentProvider {
  INTERNAL = 'internal',
  STRIPE = 'stripe',
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  type?: PaymentType;
  status?: PaymentStatus;
  orderBy?: SortOrder;
  sortBy?: string;
  bankAccountIds?: string[];
}
