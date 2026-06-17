import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { BankAccount } from '@/types/bank-account';
import { getApiErrorMessage } from '@/utils/error';

export interface GetBankAccountsParams extends PaginationParams {
  userId?: string;
}

export const useBankAccounts = (params?: GetBankAccountsParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BANK_ACCOUNTS, params],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<BankAccount>>(API_ROUTES.BANK_ACCOUNTS.GET_BANK_ACCOUNTS, { params })
        .then((res) => res.data),
  });

export const useBankAccount = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.BANK_ACCOUNT_BY_ID(id),
    queryFn: () =>
      apiClient.get<BankAccount>(API_ROUTES.BANK_ACCOUNTS.GET_BANK_ACCOUNT_BY_ID(id)).then((res) => res.data),
    enabled: !!id,
  });

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: { name: string }) =>
      apiClient.post<BankAccount>(API_ROUTES.BANK_ACCOUNTS.GET_BANK_ACCOUNTS, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      enqueueSnackbar('Account created successfully.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to create account.'), {
        variant: 'error',
      });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient
        .put<BankAccount>(API_ROUTES.BANK_ACCOUNTS.GET_BANK_ACCOUNT_BY_ID(id), { name })
        .then((res) => res.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNT_BY_ID(id) });
      enqueueSnackbar('Account name updated.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to update account.'), {
        variant: 'error',
      });
    },
  });
};
