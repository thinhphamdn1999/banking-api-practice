import { Brackets, EntityManager, FindOptionsWhere } from 'typeorm';

import { getDataSource } from '@/common/configs/database';

import { SortOrder } from '@/common/constants/filter-parameter';

import { PaginationOptions } from '@/common/types/pagination';
import { emptyPaginatedResult, paginateQueryBuilder } from '@/common/utils/pagination';
import { FilterOptions, UpdateTransactionInput } from '@/modules/transaction/types/transaction';

import { BaseRepository } from '@/common/repository/base.repository';

import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super(getDataSource().getRepository(Transaction));
  }

  async findTransactions(
    pagination: PaginationOptions,
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ) {
    if (!isAdmin && !userId) return emptyPaginatedResult<Transaction>(pagination);

    const queryBuilder = this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.fromAccount', 'fromAccount')
      .leftJoinAndSelect('transaction.toAccount', 'toAccount')
      .leftJoin('fromAccount.user', 'fromUser')
      .leftJoin('toAccount.user', 'toUser');

    if (filter?.type) queryBuilder.andWhere('transaction.type = :type', { type: filter.type });
    if (filter?.status)
      queryBuilder.andWhere('transaction.status = :status', { status: filter.status });
    if (filter?.fromDate)
      queryBuilder.andWhere('transaction.createdAt >= :fromDate', { fromDate: filter.fromDate });
    if (filter?.toDate)
      queryBuilder.andWhere('transaction.createdAt <= :toDate', { toDate: filter.toDate });

    // Non-admin users can only see transactions linked to their own accounts
    if (!isAdmin) {
      queryBuilder.andWhere(
        new Brackets((bracket) =>
          bracket
            .where('fromUser.id = :userId', { userId })
            .orWhere('toUser.id = :userId', { userId }),
        ),
      );
    }

    // Optionally narrow to specific account IDs (used on the admin user detail page)
    if (filter?.bankAccountIds?.length) {
      queryBuilder.andWhere(
        new Brackets((bracket) =>
          bracket
            .where('fromAccount.id IN (:...accountIds)', { accountIds: filter.bankAccountIds })
            .orWhere('toAccount.id IN (:...accountIds)', { accountIds: filter.bankAccountIds }),
        ),
      );
    }

    queryBuilder.orderBy(
      `transaction.${filter?.sortBy ?? 'createdAt'}`,
      (filter?.orderBy ?? SortOrder.DESC).toUpperCase() as 'ASC' | 'DESC',
    );

    return await paginateQueryBuilder<Transaction>(queryBuilder, pagination);
  }

  async findByIdWithRelation(id: string, userId: string, isAdmin: boolean) {
    const where: FindOptionsWhere<Transaction>[] = isAdmin
      ? [{ id }]
      : [
          { id, fromAccount: { user: { id: userId } } },
          { id, toAccount: { user: { id: userId } } },
        ];

    return this.repository.findOne({
      where,
      relations: {
        fromAccount: true,
        toAccount: true,
      },
    });
  }

  async findByIdempotencyKey(idempotencyKey: string, manager?: EntityManager) {
    return this.getRepository(manager).findOne({
      where: { idempotencyKey },
      relations: {
        fromAccount: true,
        toAccount: true,
      },
    });
  }

  async updateAndGetTransactionWithRelation(input: UpdateTransactionInput, id: string) {
    return this.update(input, id, undefined, {
      fromAccount: true,
      toAccount: true,
    });
  }
}
