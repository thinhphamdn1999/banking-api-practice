export interface PaginationMetadata {
  limit: number;
  offset: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}
