export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiError {
  errCode: string;
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors: ApiError[];
}
