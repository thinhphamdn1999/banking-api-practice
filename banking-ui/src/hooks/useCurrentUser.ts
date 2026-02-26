import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { usersService } from '@/services/users.service';

/**
 * Returns the currently authenticated user from our API.
 *
 * The banking-api has no /me endpoint, so we fetch the user list and match
 * by clerkUserId. Fetches up to 100 users — acceptable for a practice app.
 *
 * Replaces the Step 3 stub. AdminRoute and ProfilePage depend on this.
 */
export const useCurrentUser = () => {
  const { user: clerkUser } = useUser();

  return useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: async () => {
      const response = await usersService.getAll({ limit: 100 });
      return response.data.find((u) => u.clerkUserId === clerkUser?.id) ?? null;
    },
    enabled: !!clerkUser?.id,
    staleTime: 5 * 60 * 1000, // 5 min — role/status rarely changes
  });
};

/** Convenience hook — returns true when the current user has the admin role. */
export const useIsAdmin = () => {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.role === 'admin';
};
