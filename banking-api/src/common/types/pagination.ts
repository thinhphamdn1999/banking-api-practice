/** Pagination state included in every paginated API response. */
export interface PaginationMetadata {
  limit: number;
  offset: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

/** Standard shape of a paginated API response. */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

/** Query options for endpoints that support pagination. */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}
