import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type { CreateTransactionPayload, GetTransactionsParams, Transaction } from '@/types/transaction';
import { getApiErrorMessage } from '@/utils/error';

export const useTransactions = (params?: GetTransactionsParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, params],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Transaction>>(API_ROUTES.TRANSACTIONS.GET_TRANSACTIONS, { params })
        .then((res) => res.data),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.TRANSACTION_BY_ID(id),
    queryFn: () =>
      apiClient.get<Transaction>(API_ROUTES.TRANSACTIONS.GET_TRANSACTION_BY_ID(id)).then((res) => res.data),
    enabled: !!id,
  });

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ idempotencyKey, ...data }: CreateTransactionPayload) =>
      apiClient
        .post<Transaction>(API_ROUTES.TRANSACTIONS.GET_TRANSACTIONS, data, {
          headers: { 'Idempotency-Key': idempotencyKey },
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      enqueueSnackbar('Transaction completed successfully.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to process transaction.'), {
        variant: 'error',
      });
    },
  });
};

export const useUpdateTransactionDescription = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) =>
      apiClient
        .put<Transaction>(API_ROUTES.TRANSACTIONS.GET_TRANSACTION_BY_ID(id), { description })
        .then((res) => res.data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTION_BY_ID(id) });
      enqueueSnackbar('Description updated.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to update description.'), {
        variant: 'error',
      });
    },
  });
};
