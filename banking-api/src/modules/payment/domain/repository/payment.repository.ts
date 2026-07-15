import { BaseRepository } from '@/common/repository/base.repository';
import { Payment } from '../entities/payment.entity';
import { getDataSource } from '@/common/configs/database';
import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions, PaymentStatus } from '../../types/payment';
import { emptyPaginatedResult, paginateQueryBuilder } from '@/common/utils/pagination';
import { Brackets, FindOptionsWhere } from 'typeorm';
import { SortOrder } from '@/common/constants/filter-parameter';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super(getDataSource().getRepository(Payment));
  }

  async findPayments(
    pagination: PaginationOptions,
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ) {
    if (!isAdmin && !userId) return emptyPaginatedResult<Payment>(pagination);

    const queryBuilder = this.repository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.fromAccount', 'fromAccount')
      .leftJoinAndSelect('payment.toAccount', 'toAccount')
      .leftJoin('fromAccount.user', 'fromUser')
      .leftJoin('toAccount.user', 'toUser');

    if (filter?.type) queryBuilder.andWhere('payment.type = :type', { type: filter.type });

    if (filter?.status)
      queryBuilder.andWhere('payment.status = :status', { status: filter.status });
    if (filter?.fromDate)
      queryBuilder.andWhere('payment.createdAt >= :fromDate', { fromDate: filter.fromDate });
    if (filter?.toDate)
      queryBuilder.andWhere('payment.createdAt <= :toDate', { toDate: filter.toDate });

    // Non-admin users can only see payments linked to their own accounts
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
      `payment.${filter?.sortBy ?? 'createdAt'}`,
      (filter?.orderBy ?? SortOrder.DESC).toUpperCase() as 'ASC' | 'DESC',
    );

    return await paginateQueryBuilder<Payment>(queryBuilder, pagination);
  }

  async findByIdWithRelation(id: string, userId: string, isAdmin: boolean) {
    const where: FindOptionsWhere<Payment>[] = isAdmin
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

  /**
   * Transitions a payment to a new status only when it is still in the expected status.
   * The status guard is applied in the WHERE clause so competing transitions (e.g. a user
   * cancelling while a provider webhook confirms) are resolved atomically by the database.
   * @returns true when this call performed the transition, false when the payment had already moved on.
   */
  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    expectedStatus: PaymentStatus,
    providerStatus?: string,
  ): Promise<boolean> {
    const result = await this.repository.update(
      { id, status: expectedStatus },
      { status, ...(providerStatus !== undefined && { providerStatus }) },
    );

    return result.affected === 1;
  }
}
