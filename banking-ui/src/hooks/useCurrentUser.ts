import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/queryKeys';

import { usersService } from '@/services/users.service';

export const useCurrentUser = () => {
  const { user: clerkUser } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: () => usersService.getMe(),
    enabled: !!clerkUser?.id,
    staleTime: 5 * 60 * 1000, // 5 min — role/status rarely changes
  });
};

export const useIsAdmin = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.role === 'admin';
};
