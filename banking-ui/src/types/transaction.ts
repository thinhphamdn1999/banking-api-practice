import type { BankAccountSummary } from './bank-account';

export type TransactionType = 'deposit' | 'withdraw' | 'transfer';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  name: string;
  description: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: string; // decimal stored as string from the API
  currency: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  fromAccount: BankAccountSummary | null;
  toAccount: BankAccountSummary | null;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  idempotencyKey: string;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  bankAccountIds?: string[];
  orderBy?: 'ASC' | 'DESC';
  sortBy?: string;
}
