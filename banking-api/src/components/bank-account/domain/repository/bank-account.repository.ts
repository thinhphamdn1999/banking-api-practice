import { FindOptionsWhere, EntityManager } from 'typeorm';

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

  async findBankAccountByUserIdAndBankId(userId: string, bankId: string) {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        id: bankId,
      },
    });
  }

  async findByAccountNumber(accountNumber: string) {
    return await this.repository.findOne({
      where: {
        accountNumber,
      },
    });
  }

  async findByIdWithLock(id: string, manager: EntityManager) {
    return manager.getRepository(BankAccount).findOne({
      where: { id },
      // SQLite does not support lock mode
      // TODO: Switch to other tools (PostgreSQL)
      // lock: { mode: 'pessimistic_write' },
    });
  }
}
