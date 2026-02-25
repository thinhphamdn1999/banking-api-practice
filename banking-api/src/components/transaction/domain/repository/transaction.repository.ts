import {
  Between,
  EntityManager,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

import { getDataSource } from '@/common/configs/db';

import { Order } from '@/common/constants/filters';

import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions, UpdateTransactionInput } from '@/components/transaction/types/transaction';

import { BaseRepository } from '@/common/repository/base-repository';

import { Transaction } from '@/components/transaction/domain/entities/transaction.entity';

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
    const where: FindOptionsWhere<Transaction>[] = [];

    const baseCondition: FindOptionsWhere<Transaction> = {};

    if (filter?.type) {
      baseCondition.type = filter.type;
    }

    if (filter?.status) {
      baseCondition.status = filter.status;
    }

    if (filter?.fromDate && filter?.toDate) {
      baseCondition.createdAt = Between(filter.fromDate, filter.toDate);
    } else if (filter?.fromDate) {
      baseCondition.createdAt = MoreThanOrEqual(filter.fromDate);
    } else if (filter?.toDate) {
      baseCondition.createdAt = LessThanOrEqual(filter.toDate);
    }

    const hasAccountFilter = filter?.bankAccountIds && filter.bankAccountIds.length > 0;

    // no ownership restriction
    if (isAdmin) {
      if (hasAccountFilter) {
        where.push(
          { ...baseCondition, fromAccount: { id: In(filter!.bankAccountIds!) } },
          { ...baseCondition, toAccount: { id: In(filter!.bankAccountIds!) } },
        );
      } else {
        where.push(baseCondition);
      }
    } else {
      // restrict by ownership

      if (!userId) {
        where.push({ id: '__never_match__' });
      } else {
        if (hasAccountFilter) {
          where.push(
            {
              ...baseCondition,
              fromAccount: {
                id: In(filter!.bankAccountIds!),
                user: { id: userId },
              },
            },
            {
              ...baseCondition,
              toAccount: {
                id: In(filter!.bankAccountIds!),
                user: { id: userId },
              },
            },
          );
        } else {
          where.push(
            {
              ...baseCondition,
              fromAccount: { user: { id: userId } },
            },
            {
              ...baseCondition,
              toAccount: { user: { id: userId } },
            },
          );
        }
      }
    }

    return await this.paginate(pagination, {
      where,
      relations: {
        fromAccount: true,
        toAccount: true,
      },
      order: {
        [filter?.sortBy ?? 'createdAt']: filter?.orderBy ?? Order.DESC,
      },
    });
  }

  async findByIdWithRelation(id: string, userId: string, isAdmin: boolean) {
    const qb = this.getRepository()
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.fromAccount', 'from')
      .leftJoinAndSelect('t.toAccount', 'to')
      .where('t.id = :transactionId', { id });

    if (!isAdmin) {
      qb.andWhere('(from.userId = :userId OR to.userId = :userId)', { userId });
    }

    return qb.getOne();
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
