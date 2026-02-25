export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  PROFILE: '/profile',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  adminUserDetail: (id: string) => `/admin/users/${id}`,
} as const;
