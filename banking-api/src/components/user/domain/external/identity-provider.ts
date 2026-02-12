import { UserStatus } from '@/components/user/types/user';

export interface UserInfo {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt?: Date;
  status: UserStatus;
}

export interface IdentityProvider {
  getUser(id: string): Promise<UserInfo>;
  lockUser(id: string): Promise<void>;
}
