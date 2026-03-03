import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { transactionsService } from '@/services/transactions.service';
import type { CreateTransactionPayload, GetTransactionsParams } from '@/types/transaction';
import { getApiErrorMessage } from '@/utils/error';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useTransactions = (params?: GetTransactionsParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, params],
    queryFn: () => transactionsService.getAll(params),
    placeholderData: keepPreviousData,
  });

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.transaction(id),
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
  });

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateTransactionPayload) => transactionsService.create(data),
    onSuccess: () => {
      // Invalidate both — balance changes after every transaction
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
      transactionsService.updateDescription(id, description),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transaction(id) });
      enqueueSnackbar('Description updated.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to update description.'), {
        variant: 'error',
      });
    },
  });
};
