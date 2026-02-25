import { SignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Box from '@mui/material/Box';

import { ROUTES } from '@/constants/routes';

export const SignUpPage = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <SignUp routing="path" path={ROUTES.SIGN_UP} signInUrl={ROUTES.SIGN_IN} />
    </Box>
  );
};
