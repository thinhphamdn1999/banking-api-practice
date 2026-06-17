import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { User, UserStatus } from '@/types/user';
import { getApiErrorMessage } from '@/utils/error';

export interface GetUsersParams extends PaginationParams {
  status?: UserStatus;
}

export const useUsers = (params?: GetUsersParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () =>
      apiClient.get<PaginatedResponse<User>>(API_ROUTES.USERS.GET_USERS, { params }).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

export const useUserById = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.USER_BY_ID(id),
    queryFn: () => apiClient.get<User>(API_ROUTES.USERS.GET_USER_BY_ID(id)).then((res) => res.data),
    enabled: !!id,
  });

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<User>(API_ROUTES.USERS.DEACTIVATE(id)).then((res) => res.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BY_ID(id) });
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
    mutationFn: (id: string) =>
      apiClient.post<User>(API_ROUTES.USERS.ACTIVATE(id)).then((res) => res.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BY_ID(id) });
      enqueueSnackbar('User activated successfully.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to activate user.'), {
        variant: 'error',
      });
    },
  });
};
