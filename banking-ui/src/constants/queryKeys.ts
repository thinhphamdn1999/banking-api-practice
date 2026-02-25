export const QUERY_KEYS = {
  // Current logged-in user profile
  CURRENT_USER: ['current-user'] as const,

  // Users (admin)
  USERS: ['users'] as const,
  user: (id: string) => ['users', id] as const,

  // Bank accounts
  BANK_ACCOUNTS: ['bank-accounts'] as const,
  bankAccount: (id: string) => ['bank-accounts', id] as const,

  // Transactions
  TRANSACTIONS: ['transactions'] as const,
  transaction: (id: string) => ['transactions', id] as const,
} as const;
