import { IdentityProvider } from '@/components/user/domain/external/identity-provider';

import { UserRepository } from '@/components/user/domain/repository/user.repository';
import { UserStatus } from '../types/user';

export class ClerkWebhook {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly identityProvider: IdentityProvider,
  ) {}

  async handleUserCreated(clerkUserId: string) {
    const existingUser = await this.userRepo.findByClerkUserId(clerkUserId);
    if (existingUser) {
      return;
    }

    const user = await this.identityProvider.getUser(clerkUserId);
    await this.userRepo.create({
      clerkUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  }

  async handleUserDeleted(clerkUserId: string) {
    const user = await this.userRepo.findByClerkUserId(clerkUserId);
    if (!user) {
      return;
    }

    await this.userRepo.update({ status: UserStatus.DELETED, deletedAt: new Date() }, user.id);
  }

  async handleUserUpdated(clerkUserId: string) {
    const user = await this.userRepo.findByClerkUserId(clerkUserId);
    if (!user) {
      return;
    }

    const updatedInfo = await this.identityProvider.getUser(clerkUserId);
    await this.userRepo.update(
      {
        email: updatedInfo.email,
        firstName: updatedInfo.firstName,
        lastName: updatedInfo.lastName,
        username: updatedInfo.username,
        avatarUrl: updatedInfo.avatarUrl,
        updatedAt: updatedInfo.updatedAt,
        status: updatedInfo.status,
      },
      user.id,
    );
  }
}
