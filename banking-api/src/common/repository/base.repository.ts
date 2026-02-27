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

import { DEFAULT_PAGINATION_LIMIT_ITEM, DEFAULT_PAGINATION_PAGE } from '../constants/pagination';

/**
 * BaseRepository is an abstract class that provides common database operations for entities.
 * It uses TypeORM's Repository under the hood and provides methods for pagination, finding by ID, creating, updating, and deleting entities.
 * This class can be extended by specific repositories for different entities to inherit these common operations.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  /**
   * Helper method to get the repository instance, optionally using an EntityManager for transactions.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the repository to participate in transactions. If not provided, the default repository instance is used.
   * @returns - The Repository instance for the entity, either from the EntityManager or the default repository.
   */
  protected getRepository(entityManager?: EntityManager): Repository<T> {
    return entityManager ? entityManager.getRepository(this.repository.target) : this.repository;
  }

  /**
   * Helper method to perform paginated queries on the repository. It calculates the offset and limit based on the provided pagination options, executes the query with the given FindManyOptions, and returns a PaginatedResponse containing the data and pagination metadata.
   * @param pagination - The pagination options, including page number and limit of items per page. If not provided, default values are used.
   * @param findManyOptions - The TypeORM FindManyOptions to specify the query conditions, relations, and order for fetching the data.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   * @returns - A promise that resolves to a PaginatedResponse containing the array of entities for the current page and metadata about the pagination (total count, page count, current page, etc.).
   */
  protected async getPaginated(
    pagination: PaginationOptions,
    findManyOptions: FindManyOptions<T>,
    entityManager?: EntityManager,
  ): Promise<PaginatedResponse<T>> {
    const repository = this.getRepository(entityManager);
    const limit = pagination.limit ?? DEFAULT_PAGINATION_LIMIT_ITEM;
    const currentPage = pagination.page ?? DEFAULT_PAGINATION_PAGE;
    const offset = (currentPage - 1) * limit;

    const [data, totalCount] = await repository.findAndCount({
      ...findManyOptions,
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

  /**
   * Helper method to find all entities of type T. It can optionally use an EntityManager for transactions.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   * @returns - A promise that resolves to an array of all entities of type T in the database.
   */
  protected async findAll(entityManager?: EntityManager): Promise<T[]> {
    return await this.getRepository(entityManager).find();
  }

  /**
   * Helper method to find an entity by its ID. It can optionally use an EntityManager for transactions and specify relations to be loaded with the entity.
   * @param id - The ID of the entity to find.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   * @param findOptionsRelations - Optional relations to be loaded with the entity, specified as a FindOptionsRelations object. This allows related entities to be fetched along with the main entity.
   * @returns - A promise that resolves to the entity of type T with the specified ID, or null if no such entity exists in the database. If findOptionsRelations is provided, the returned entity will include the specified related entities.
   */
  async findById(
    id: string,
    entityManager?: EntityManager,
    findOptionsRelations?: FindOptionsRelations<T>,
  ): Promise<T | null> {
    return await this.getRepository(entityManager).findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations: findOptionsRelations,
    });
  }

  /**
   * Helper method to create a new entity in the database. It takes a DeepPartial<T> object representing the new entity's properties, and optionally an EntityManager for transactions. It creates a new entity instance using the repository's create method and then saves it to the database.
   * @param entity - A DeepPartial<T> object containing the properties of the new entity to be created. This allows for partial input when creating a new entity, as TypeORM will fill in any missing properties with default values or null.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   * @returns - A promise that resolves to the newly created entity of type T after it has been saved to the database. The returned entity will include any generated fields (like ID) and default values set by the database.
   */
  async create(entity: DeepPartial<T>, entityManager?: EntityManager): Promise<T> {
    const newEntity = this.getRepository(entityManager).create(entity);
    return await this.save(newEntity);
  }

  /**
   * Helper method to update an existing entity in the database. It takes a QueryDeepPartialEntity<T> object representing the properties to be updated, the ID of the entity to update, and optionally an EntityManager for transactions and relations to be loaded with the updated entity. It performs the update operation using the repository's update method and then retrieves and returns the updated entity from the database.
   * @param entity - A QueryDeepPartialEntity<T> object containing the properties to be updated on the existing entity. This allows for partial updates, where only the specified properties will be changed and the rest will remain unchanged.
   * @param id - The ID of the entity to be updated. This is used to identify which entity in the database should be updated with the new properties.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   * @param findOptionsRelations - Optional relations to be loaded with the updated entity when it is retrieved after the update operation, specified as a FindOptionsRelations object. This allows related entities to be fetched along with the main entity in the returned result.
   * @returns - A promise that resolves to the updated entity of type T after it has been updated in the database and retrieved. The returned entity will include any changes made by the update operation, as well as any related entities specified by findOptionsRelations. If no entity with the specified ID exists, it will return null.
   */
  async update(
    entity: QueryDeepPartialEntity<T>,
    id: string,
    entityManager?: EntityManager,
    findOptionsRelations?: FindOptionsRelations<T>,
  ): Promise<T | null> {
    await this.getRepository(entityManager).update(id, entity);
    return await this.findById(id, undefined, findOptionsRelations);
  }

  /**
   * Helper method to delete an entity from the database by its ID. It can optionally use an EntityManager for transactions.
   * @param id - The ID of the entity to be deleted from the database. This is used to identify which entity should be removed.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   */
  async delete(id: string, entityManager?: EntityManager): Promise<void> {
    await this.getRepository(entityManager).delete(id);
  }

  /**
   * Helper method to save an entity to the database. It takes a DeepPartial<T> object representing the entity to be saved, and optionally an EntityManager for transactions. It uses the repository's save method to persist the entity to the database and returns the saved entity.
   * @param entity - A DeepPartial<T> object containing the properties of the entity to be saved. This allows for partial input when saving an entity, as TypeORM will fill in any missing properties with default values or null. The entity can be a new entity (without an ID) or an existing entity (with an ID) that is being updated.
   * @param entityManager - Optional EntityManager to use for database operations, which allows the method to participate in transactions. If not provided, the default repository instance is used.
   * @returns - A promise that resolves to the entity of type T after it has been saved to the database. The returned entity will include any generated fields (like ID) and default values set by the database. If the input entity had an ID and already exists in the database, it will be updated with the new properties; if it did not have an ID, a new entity will be created.
   */
  async save(entity: DeepPartial<T>, entityManager?: EntityManager): Promise<T> {
    return await this.getRepository(entityManager).save(entity);
  }
}
