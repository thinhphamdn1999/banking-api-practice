import { FilterOptions, UserStatus } from '@/modules/user/types/user';
import { PaginationOptions } from '@/common/types/pagination';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { UserRepository } from '@/modules/user/domain/repository/user.repository';
import { IdentityProvider } from '@/modules/user/domain/external/identity-provider';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly identityProvider: IdentityProvider,
  ) {}

  async findUsers(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT_ITEM,
    },
    filter?: FilterOptions,
  ) {
    const users = await this.userRepository.findUsers(pagination, filter);

    return { data: users };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    return { data: user };
  }

  async deActiveUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    // Lock on Clerk side
    await this.identityProvider.lockUser(user.clerkUserId);

    // Update status in DB
    const deactivatedUser = await this.userRepository.update(
      { status: UserStatus.DE_ACTIVE, updatedAt: new Date() },
      userId,
    );
    return { data: deactivatedUser };
  }

  async activateUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    // Unlock on Clerk side
    await this.identityProvider.unlockUser(user.clerkUserId);

    // Update status in DB
    const activatedUser = await this.userRepository.update(
      { status: UserStatus.ACTIVE, updatedAt: new Date() },
      userId,
    );
    return { data: activatedUser };
  }
}
