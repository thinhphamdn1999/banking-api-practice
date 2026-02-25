import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSnackbar } from 'notistack';

import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/services/api';

/**
 * Wires up axios interceptors for the authenticated session:
 *  - Request: injects the Clerk Bearer token into every outgoing request.
 *  - Response: handles 401 (redirect to sign-in) and 429 (rate-limit toast).
 *
 * Must be called inside a component that is within both ClerkProvider
 * and SnackbarProvider. ProtectedRoute is the right place.
 */
export const useApiInterceptors = () => {
  const { getToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const requestId = apiClient.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
          window.location.href = ROUTES.SIGN_IN;
        }

        if (status === 429) {
          enqueueSnackbar('Too many requests. Please try again later.', {
            variant: 'warning',
          });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.request.eject(requestId);
      apiClient.interceptors.response.eject(responseId);
    };
  }, [getToken, enqueueSnackbar]);
};
