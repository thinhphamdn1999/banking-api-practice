import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/errors';

import { UserRepository } from '@/components/user/domain/repository/user.repository';

import { createErrorResponse } from '@/common/utils/error-response';

const userRepository = new UserRepository();

export async function attachDbUser(req: Request, res: Response, next: NextFunction) {
  const clerkUserId = req.user?.clerkUserId;
  if (!clerkUserId) return next();

  try {
    const user = await userRepository.findByClerkUserId(clerkUserId);

    if (!user) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json(
        createErrorResponse({
          statusCode: HttpStatusCode.UNAUTHORIZED,
          errors: [
            {
              errCode: ERROR_CODES.UNAUTHENTICATED,
              message: 'Authenticated Clerk user has no matching account in this system',
            },
          ],
        }),
      );
    }

    req.user = {
      clerkUserId,
      id: user.id,
      role: user.role,
      status: user.status,
    };

    next();
  } catch {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      createErrorResponse({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        errors: [
          {
            errCode: ERROR_CODES.GENERAL_EXCEPTION,
            message: 'Failed to resolve user from database',
          },
        ],
      }),
    );
  }
}
