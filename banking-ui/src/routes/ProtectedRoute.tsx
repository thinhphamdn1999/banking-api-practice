import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes';
import { useApiInterceptors } from '@/hooks/useApiInterceptors';

export const ProtectedRoute = () => {
  const { isSignedIn, isLoaded } = useAuth();

  useApiInterceptors();

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to={ROUTES.SIGN_IN} replace />;

  return <Outlet />;
};
