import type { BankAccountSummary } from './bank-account';

export type TransactionType = 'deposit' | 'withdraw' | 'transfer';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface TransactionAmount {
  amount: number;
  currency: string;
}

export interface Transaction {
  id: string;
  name: string;
  description: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: TransactionAmount;
  idempotencyKey: string;
  fromAccountBalance: string | null;
  toAccountBalance: string | null;
  createdAt: string;
  updatedAt: string;
  fromAccount: BankAccountSummary | null;
  toAccount: BankAccountSummary | null;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: TransactionAmount;
  idempotencyKey: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
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
