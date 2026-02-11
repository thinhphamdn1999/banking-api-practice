import { FilterOptions } from '@/components/user/types/user';

import { ERROR_CODES } from '@/common/constants/errors';
import { PaginationOptions } from '@/common/types/pagination';
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';

import { User } from '@/components/user/domain/entities/user.entity';
import { UserRepository } from '@/components/user/domain/repository/user.repository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
      return { error: ERROR_CODES.USER_NOT_FOUND };
    }

    return { data: user };
  }

  async getUserByClerkUserId(clerkUserId: string) {
    const user = await this.userRepository.findByClerkUserId(clerkUserId);
    if (!user) {
      return { error: ERROR_CODES.USER_NOT_FOUND };
    }

    return { data: user };
  }

  async createUser(input: Partial<User>) {
    const newUser = await this.userRepository.create(input);
    return { data: newUser };
  }

  async updateUser(userId: string, input: Partial<User>) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { error: ERROR_CODES.USER_NOT_FOUND };
    }

    const updatedUser = await this.userRepository.update(input, userId);
    return { data: updatedUser };
  }
}
