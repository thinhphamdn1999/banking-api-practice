export const QUERY_KEYS = {
  CURRENT_USER: ['current-user'] as const,
  USERS: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  BANK_ACCOUNTS: ['bank-accounts'] as const,
  bankAccount: (id: string) => ['bank-accounts', id] as const,
  TRANSACTIONS: ['transactions'] as const,
  transaction: (id: string) => ['transactions', id] as const,
} as const;
