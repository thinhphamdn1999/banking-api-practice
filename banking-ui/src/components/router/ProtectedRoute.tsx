import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes';

/**
 * Redirects unauthenticated users to /sign-in.
 * Shows a loading screen while Clerk resolves the auth state.
 */
export const ProtectedRoute = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to={ROUTES.SIGN_IN} replace />;

  return <Outlet />;
};
