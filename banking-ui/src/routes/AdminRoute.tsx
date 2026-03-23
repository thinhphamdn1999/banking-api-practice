import { Navigate, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const AdminRoute = () => {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (currentUser?.role !== 'admin') return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
};
