import { clerkClient } from '@clerk/express';

import { MILLISECONDS_PER_SECOND } from '@/common/constants/time';

import { UserStatus } from '@/modules/user/types/user';

import { IdentityProvider } from '@/modules/user/domain/external/identity-provider';

export class ClerkIdentityProvider implements IdentityProvider {
  async getUser(clerkUserId: string) {
    const user = await clerkClient.users.getUser(clerkUserId);

    return {
      email: user.primaryEmailAddress?.emailAddress ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      username: user.username ?? null,
      avatarUrl: user.imageUrl ?? null,
      createdAt: new Date(user.createdAt * MILLISECONDS_PER_SECOND),
      updatedAt: user.updatedAt ? new Date(user.updatedAt * MILLISECONDS_PER_SECOND) : undefined,
      status: user.locked ? UserStatus.DE_ACTIVE : UserStatus.ACTIVE,
    };
  }

  async lockUser(clerkUserId: string): Promise<void> {
    await clerkClient.users.lockUser(clerkUserId);
  }

  async unlockUser(clerkUserId: string): Promise<void> {
    await clerkClient.users.unlockUser(clerkUserId);
  }
}
