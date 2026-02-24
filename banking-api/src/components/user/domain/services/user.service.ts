import { FilterOptions, UserStatus } from '@/components/user/types/user';
import { PaginationOptions } from '@/common/types/pagination';

import { ERROR_CODES } from '@/common/constants/errors';
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';

import { User } from '@/components/user/domain/entities/user.entity';
import { UserRepository } from '@/components/user/domain/repository/user.repository';
import { IdentityProvider } from '@/components/user/domain/external/identity-provider';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly identityProvider: IdentityProvider,
  ) {}

  async findUsers(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT,
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

  async createUser(input: Partial<User>) {
    const newUser = await this.userRepository.create(input);
    return { data: newUser };
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
}
