import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { bankAccountsService } from '@/services/bank-accounts.service';
import type { GetBankAccountsParams } from '@/services/bank-accounts.service';
import { getApiErrorMessage } from '@/utils/error';

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useBankAccounts = (params?: GetBankAccountsParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BANK_ACCOUNTS, params],
    queryFn: () => bankAccountsService.getAll(params),
  });

export const useBankAccount = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.bankAccount(id),
    queryFn: () => bankAccountsService.getById(id),
    enabled: !!id,
  });

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: { name: string }) => bankAccountsService.create(data),
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
      bankAccountsService.update(id, { name }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bankAccount(id) });
      enqueueSnackbar('Account name updated.', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getApiErrorMessage(error, 'Failed to update account.'), {
        variant: 'error',
      });
    },
  });
};
