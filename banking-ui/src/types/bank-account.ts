import type { User } from './user';

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: string; // decimal stored as string from the API
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

// Minimal shape used inside nested Transaction responses
export type BankAccountSummary = Pick<BankAccount, 'id' | 'name' | 'accountNumber'>;
