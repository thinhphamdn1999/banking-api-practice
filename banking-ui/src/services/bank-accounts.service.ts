import type { PaginatedResponse, PaginationParams, SingleResponse } from '@/types/api';
import type { BankAccount } from '@/types/bank-account';

import { apiClient } from './api';

export interface GetBankAccountsParams extends PaginationParams {
  userId?: string;
}

export const bankAccountsService = {
  getAll: (params?: GetBankAccountsParams) =>
    apiClient
      .get<PaginatedResponse<BankAccount>>('/bank-accounts', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient.get<SingleResponse<BankAccount>>(`/bank-accounts/${id}`).then((res) => res.data),

  create: (data: { name: string }) =>
    apiClient.post<SingleResponse<BankAccount>>('/bank-accounts', data).then((res) => res.data),

  update: (id: string, data: { name: string }) =>
    apiClient
      .put<SingleResponse<BankAccount>>(`/bank-accounts/${id}`, data)
      .then((res) => res.data),
};
