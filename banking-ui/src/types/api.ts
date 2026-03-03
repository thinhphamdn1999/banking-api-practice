export interface PaginationMeta {
  limit: number;
  offset: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
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
