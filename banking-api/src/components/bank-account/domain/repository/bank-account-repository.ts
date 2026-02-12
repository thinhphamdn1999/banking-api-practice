import { FindOptionsWhere } from 'typeorm';

import { getDataSource } from '@/common/configs/db';

import { Order } from '@/common/constants/filters';

import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions } from '@/components/bank-account/types/bank-account';

import { BaseRepository } from '@/common/repository/base-repository';

import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';

export class BankAccountRepository extends BaseRepository<BankAccount> {
  constructor() {
    super(getDataSource().getRepository(BankAccount));
  }

  async findBankAccounts(pagination: PaginationOptions, filter?: FilterOptions) {
    const where: FindOptionsWhere<BankAccount> = {};

    if (filter?.userId) {
      where.user = { id: filter.userId };
    }

    return await this.paginate(pagination, {
      where,
      order: { createdAt: Order.DESC },
    });
  }
}
