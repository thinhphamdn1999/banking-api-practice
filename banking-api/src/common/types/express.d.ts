import 'express';

import type { UserRole, UserStatus } from '@/modules/user/types/user';

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkUserId: string;
        id?: string;
        role?: UserRole;
        status?: UserStatus;
      };
    }
  }
}
