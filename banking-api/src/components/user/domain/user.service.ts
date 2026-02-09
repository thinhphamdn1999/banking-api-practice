import { ApiResponse } from '@/common/types/response';

import { User } from '@/components/user/data-access/user.entity';

import { userRepo } from '@/components/user/data-access/user.repository';

const userRepository = userRepo();

/**
 * Find all users
 * @returns - list all users
 */
export async function findUsers(): Promise<ApiResponse<User[]>> {
  const users = await userRepository.find({});

  return { data: users };
}
