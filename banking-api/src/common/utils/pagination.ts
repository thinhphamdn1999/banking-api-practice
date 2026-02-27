import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { DEFAULT_PAGINATION_LIMIT_ITEM, DEFAULT_PAGINATION_PAGE } from '../constants/pagination';
import { PaginatedResponse, PaginationOptions } from '../types/pagination';

/** Runs a QueryBuilder query with skip/take and returns a paginated response. */
export async function paginateQueryBuilder<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  pagination: PaginationOptions,
): Promise<PaginatedResponse<T>> {
  const limit = pagination.limit ?? DEFAULT_PAGINATION_LIMIT_ITEM;
  const currentPage = pagination.page ?? DEFAULT_PAGINATION_PAGE;
  const offset = (currentPage - 1) * limit;

  const [data, totalCount] = await queryBuilder.skip(offset).take(limit).getManyAndCount();

  return {
    data,
    metadata: {
      limit,
      offset,
      currentPage,
      pageCount: Math.ceil(totalCount / limit),
      totalCount,
    },
  };
}

/** Returns an empty paginated result without hitting the database. */
export function emptyPaginatedResult<T>(pagination: PaginationOptions): PaginatedResponse<T> {
  const limit = pagination.limit ?? DEFAULT_PAGINATION_LIMIT_ITEM;
  const currentPage = pagination.page ?? DEFAULT_PAGINATION_PAGE;

  return {
    data: [],
    metadata: { limit, offset: 0, currentPage, pageCount: 0, totalCount: 0 },
  };
}
