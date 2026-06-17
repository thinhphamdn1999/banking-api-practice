export const API_ROUTES = {
  USERS: {
    GET_USERS: '/v1/users',
    GET_ME: '/v1/users/me',
    GET_USER_BY_ID: (id: string) => `/v1/users/${id}`,
    DEACTIVATE: (id: string) => `/v1/users/${id}/de-active`,
    ACTIVATE: (id: string) => `/v1/users/${id}/activate`,
  },
  BANK_ACCOUNTS: {
    GET_BANK_ACCOUNTS: '/v1/bank-accounts',
    GET_BANK_ACCOUNT_BY_ID: (id: string) => `/v1/bank-accounts/${id}`,
  },
  TRANSACTIONS: {
    GET_TRANSACTIONS: '/v1/transactions',
    GET_TRANSACTION_BY_ID: (id: string) => `/v1/transactions/${id}`,
  },
} as const;
