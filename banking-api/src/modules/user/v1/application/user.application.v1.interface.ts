import { PaginatedResponse, PaginationOptions } from '@/common/types/pagination';
import { FilterOptions } from '@/modules/user/types/user';
import { User } from '@/modules/user/domain/entities/user.entity';

export interface UserApplicationService {
  findUsers(
    pagination: PaginationOptions,
    filter?: FilterOptions,
  ): Promise<PaginatedResponse<User>>;
  getUserById(userId: string): Promise<User>;
  deActiveUser(userId: string): Promise<User>;
  activateUser(userId: string): Promise<User>;
}
