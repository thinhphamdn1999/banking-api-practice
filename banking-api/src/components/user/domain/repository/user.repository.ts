import { FindOptionsWhere } from 'typeorm';

import { getDataSource } from '@/common/configs/db';

import { Order } from '@/common/constants/filters';

import { FilterOptions } from '@/components/user/types/user';
import { PaginationOptions } from '@/common/types/pagination';

import { User } from '@/components/user/domain/entities/user.entity';

import { BaseRepository } from '@/common/repository/base-repository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(getDataSource().getRepository(User));
  }

  async findUsers(pagination: PaginationOptions, filter?: FilterOptions) {
    const where: FindOptionsWhere<User> = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    return await this.paginate(pagination, {
      where,
      order: { createdAt: Order.DESC },
    });
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | null> {
    return await this.repository.findOne({ where: { clerkUserId } });
  }
}
