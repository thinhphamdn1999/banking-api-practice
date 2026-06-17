import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions } from '@/modules/user/types/user';

import { UserService } from '@/modules/user/domain/services/user.service';

import { UserApplicationService } from '@/modules/user/v1/application/user.application.v1.interface';

export class UserApplicationServiceV1 implements UserApplicationService {
  constructor(private readonly userService: UserService) {}

  async findUsers(pagination: PaginationOptions, filter?: FilterOptions) {
    return this.userService.findUsers(pagination, filter);
  }

  async getUserById(userId: string) {
    return this.userService.getUserById(userId);
  }

  async deActiveUser(userId: string) {
    return this.userService.deActiveUser(userId);
  }

  async activateUser(userId: string) {
    return this.userService.activateUser(userId);
  }
}
