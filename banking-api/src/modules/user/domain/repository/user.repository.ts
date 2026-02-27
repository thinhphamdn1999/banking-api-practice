import { FindOptionsWhere } from 'typeorm';

import { getDataSource } from '@/common/configs/database';

import { SortOrder } from '@/common/constants/filter-parameter';

import { FilterOptions } from '@/modules/user/types/user';
import { PaginationOptions } from '@/common/types/pagination';

import { User } from '@/modules/user/domain/entities/user.entity';

import { BaseRepository } from '@/common/repository/base.repository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(getDataSource().getRepository(User));
  }

  async findUsers(pagination: PaginationOptions, filter?: FilterOptions) {
    const where: FindOptionsWhere<User> = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    return await this.getPaginated(pagination, {
      where,
      order: { createdAt: SortOrder.DESC },
    });
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | null> {
    return await this.repository.findOne({ where: { clerkUserId } });
  }
}
