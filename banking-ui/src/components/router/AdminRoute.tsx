import { Navigate, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Allows access only to users with role === 'admin'.
 * Redirects to /dashboard for authenticated non-admin users.
 *
 * NOTE: useCurrentUser will be fully implemented in Step 5 (custom hooks + API layer).
 */
export const AdminRoute = () => {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (currentUser?.role !== 'admin') return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
};
