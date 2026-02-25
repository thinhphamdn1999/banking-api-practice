import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { AdminRoute } from '@/components/router/AdminRoute';
import { ProtectedRoute } from '@/components/router/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { ROUTES } from '@/constants/routes';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { BankAccountsPage } from '@/pages/BankAccountsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';

const router = createBrowserRouter([
  // Redirect root to dashboard
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // Public routes — Clerk handles auth UI
  {
    path: ROUTES.SIGN_IN + '/*',
    element: <SignInPage />,
  },
  {
    path: ROUTES.SIGN_UP + '/*',
    element: <SignUpPage />,
  },

  // Protected routes — requires Clerk authentication
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.ACCOUNTS, element: <BankAccountsPage /> },
          { path: ROUTES.TRANSACTIONS, element: <TransactionsPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },

          // Admin-only routes — requires role === 'admin'
          {
            element: <AdminRoute />,
            children: [
              { path: ROUTES.ADMIN_USERS, element: <AdminUsersPage /> },
              { path: ROUTES.ADMIN_USER_DETAIL, element: <AdminUserDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
