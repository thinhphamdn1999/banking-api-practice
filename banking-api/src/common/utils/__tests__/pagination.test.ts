/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { paginateQueryBuilder, emptyPaginatedResult } from '../pagination';

type MockQB<T extends ObjectLiteral> = Partial<Record<keyof SelectQueryBuilder<T>, jest.Mock>>;

describe('paginateQueryBuilder', () => {
  let mockQueryBuilder: MockQB<any>;

  beforeEach(() => {
    mockQueryBuilder = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };
  });

  it('should apply default pagination values when none provided', async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    const totalCount = 10;

    mockQueryBuilder.getManyAndCount!.mockResolvedValue([mockData, totalCount]);

    const result = await paginateQueryBuilder(
      mockQueryBuilder as unknown as SelectQueryBuilder<any>,
      {},
    );

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(
      (DEFAULT_PAGINATION_PAGE - 1) * DEFAULT_PAGINATION_LIMIT_ITEM,
    );

    expect(mockQueryBuilder.take).toHaveBeenCalledWith(DEFAULT_PAGINATION_LIMIT_ITEM);

    expect(result).toEqual({
      data: mockData,
      metadata: {
        limit: DEFAULT_PAGINATION_LIMIT_ITEM,
        offset: (DEFAULT_PAGINATION_PAGE - 1) * DEFAULT_PAGINATION_LIMIT_ITEM,
        currentPage: DEFAULT_PAGINATION_PAGE,
        pageCount: Math.ceil(totalCount / DEFAULT_PAGINATION_LIMIT_ITEM),
        totalCount,
      },
    });
  });

  it('should use provided pagination values', async () => {
    const pagination = { page: 2, limit: 5 };
    const mockData = [{ id: 3 }];
    const totalCount = 12;

    mockQueryBuilder.getManyAndCount!.mockResolvedValue([mockData, totalCount]);

    const result = await paginateQueryBuilder(
      mockQueryBuilder as unknown as SelectQueryBuilder<any>,
      pagination,
    );

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);

    expect(result.metadata).toEqual({
      limit: 5,
      offset: 5,
      currentPage: 2,
      pageCount: Math.ceil(totalCount / 5),
      totalCount,
    });
  });

  it('should calculate correct pageCount when totalCount is 0', async () => {
    mockQueryBuilder.getManyAndCount!.mockResolvedValue([[], 0]);

    const result = await paginateQueryBuilder(
      mockQueryBuilder as unknown as SelectQueryBuilder<any>,
      { page: 1, limit: 10 },
    );

    expect(result.metadata.pageCount).toBe(0);
  });
});

describe('emptyPaginatedResult', () => {
  it('should return empty paginated result with defaults', () => {
    const result = emptyPaginatedResult({});

    expect(result).toEqual({
      data: [],
      metadata: {
        limit: DEFAULT_PAGINATION_LIMIT_ITEM,
        offset: 0,
        currentPage: DEFAULT_PAGINATION_PAGE,
        pageCount: 0,
        totalCount: 0,
      },
    });
  });

  it('should return empty paginated result with provided pagination', () => {
    const result = emptyPaginatedResult({ page: 3, limit: 20 });

    expect(result).toEqual({
      data: [],
      metadata: {
        limit: 20,
        offset: 0,
        currentPage: 3,
        pageCount: 0,
        totalCount: 0,
      },
    });
  });
});
