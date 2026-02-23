import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryDeepPartialEntity,
  Repository,
  EntityManager,
  FindOptionsRelations,
} from 'typeorm';

import { PaginatedResponse, PaginationOptions } from '../types/pagination';

import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '../constants/pagination';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  protected getRepository(manager?: EntityManager): Repository<T> {
    return manager ? manager.getRepository(this.repository.target) : this.repository;
  }

  protected async paginate(
    pagination: PaginationOptions,
    options: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<PaginatedResponse<T>> {
    const repository = this.getRepository(manager);
    const limit = pagination.limit ?? DEFAULT_PAGINATION_LIMIT;
    const currentPage = pagination.page ?? DEFAULT_PAGINATION_PAGE;
    const offset = (currentPage - 1) * limit;

    const [data, totalCount] = await repository.findAndCount({
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

  protected async findAll(manager?: EntityManager): Promise<T[]> {
    return await this.getRepository(manager).find();
  }

  async findById(
    id: string,
    manager?: EntityManager,
    relations?: FindOptionsRelations<T>,
  ): Promise<T | null> {
    return await this.getRepository(manager).findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
    });
  }

  async create(entity: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    const newEntity = this.getRepository(manager).create(entity);
    return await this.save(newEntity);
  }

  async update(
    entity: QueryDeepPartialEntity<T>,
    id: string,
    manager?: EntityManager,
  ): Promise<T | null> {
    await this.getRepository(manager).update(id, entity);
    return this.findById(id);
  }

  async delete(id: string, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).delete(id);
  }

  async save(entity: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    return await this.getRepository(manager).save(entity);
  }
}
