import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { usersService } from '@/services/users.service';
import type { GetUsersParams } from '@/services/users.service';
import { getApiErrorMessage } from '@/utils/error';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useUsers = (params?: GetUsersParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => usersService.getAll(params),
    placeholderData: keepPreviousData,
  });

// Named useUserById to avoid collision with Clerk's useUser hook
export const useUserById = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
      enqueueSnackbar('User deactivated successfully.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to deactivate user.'), {
        variant: 'error',
      });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => usersService.activate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
      enqueueSnackbar('User activated successfully.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to activate user.'), {
        variant: 'error',
      });
    },
  });
};
