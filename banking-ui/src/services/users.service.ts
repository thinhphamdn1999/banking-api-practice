import type { PaginatedResponse, PaginationParams, SingleResponse } from '@/types/api';
import type { User, UserStatus } from '@/types/user';

import { apiClient } from './api';

export interface GetUsersParams extends PaginationParams {
  status?: UserStatus;
}

export const usersService = {
  getAll: (params?: GetUsersParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }).then((res) => res.data),

  getById: (id: string) =>
    apiClient.get<SingleResponse<User>>(`/users/${id}`).then((res) => res.data),

  deactivate: (id: string) =>
    apiClient.post<SingleResponse<User>>(`/users/${id}/de-active`).then((res) => res.data),
};
