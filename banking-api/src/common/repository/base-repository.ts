import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

import { PaginatedResponse, PaginationOptions } from '../types/pagination';

import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '../constants/pagination';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  protected async paginate(
    pagination: PaginationOptions,
    options: FindManyOptions<T>,
  ): Promise<PaginatedResponse<T>> {
    const limit = pagination.limit ?? DEFAULT_PAGINATION_LIMIT;
    const currentPage = pagination.page ?? DEFAULT_PAGINATION_PAGE;
    const offset = (currentPage - 1) * limit;

    const [data, totalCount] = await this.repository.findAndCount({
      ...options,
      skip: offset,
      take: limit,
    });

    const pageCount = Math.ceil(totalCount / limit);

    return {
      data,
      metadata: {
        limit,
        offset,
        currentPage,
        pageCount,
        totalCount,
      },
    };
  }

  protected async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOneBy({ id } as unknown as FindOptionsWhere<T>);
  }

  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as T);
    return await this.save(newEntity);
  }

  async update(entity: QueryDeepPartialEntity<T>, id: string): Promise<T | null> {
    await this.repository.update(id, entity);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async save(entity: DeepPartial<T>): Promise<T> {
    return await this.repository.save(entity);
  }
}
