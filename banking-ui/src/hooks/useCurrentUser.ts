import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api';
import type { User } from '@/types/user';

export const useCurrentUser = () => {
  const { user: clerkUser } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: () => apiClient.get<User>(API_ROUTES.USERS.GET_ME).then((res) => res.data),
    enabled: !!clerkUser?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useIsAdmin = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.role === 'admin';
};
