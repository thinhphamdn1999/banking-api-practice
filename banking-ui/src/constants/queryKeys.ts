export const QUERY_KEYS = {
  CURRENT_USER: ['current-user'] as const,
  USERS: ['users'] as const,
  USER_BY_ID: (id: string) => ['users', id] as const,
  BANK_ACCOUNTS: ['bank-accounts'] as const,
  BANK_ACCOUNT_BY_ID: (id: string) => ['bank-accounts', id] as const,
  TRANSACTIONS: ['transactions'] as const,
  TRANSACTION_BY_ID: (id: string) => ['transactions', id] as const,
} as const;
