import type { PaginatedResponse, SingleResponse } from '@/types/api';
import type {
  CreateTransactionPayload,
  GetTransactionsParams,
  Transaction,
} from '@/types/transaction';

import { apiClient } from './api';

export const transactionsService = {
  getAll: (params?: GetTransactionsParams) =>
    apiClient
      .get<PaginatedResponse<Transaction>>('/transactions', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient.get<SingleResponse<Transaction>>(`/transactions/${id}`).then((res) => res.data),

  create: ({ idempotencyKey, ...data }: CreateTransactionPayload) =>
    apiClient
      .post<SingleResponse<Transaction>>('/transactions', data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      })
      .then((res) => res.data),

  updateDescription: (id: string, description: string) =>
    apiClient
      .put<SingleResponse<Transaction>>(`/transactions/${id}`, { description })
      .then((res) => res.data),
};
