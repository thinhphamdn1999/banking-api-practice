export type UserStatus = 'active' | 'de-active' | 'deleted';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  clerkUserId: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
