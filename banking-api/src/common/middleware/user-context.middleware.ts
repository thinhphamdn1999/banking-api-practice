import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';

import { UserRepository } from '@/modules/user/domain/repository/user.repository';

import { createErrorResponse } from '@/common/utils/error-response';

const userRepository = new UserRepository();

/**
 * Middleware to attach the authenticated user's database record to the request object.
 * This should be used after the `requireAuth` middleware, which ensures that the request is authenticated and sets `req.user.clerkUserId`.
 * The `attachDatabaseUser` middleware looks up the user in the database using the Clerk user ID and attaches the user's database record (including internal user ID, role, and status) to `req.user`.
 * @param req - The Express request object, which is expected to have `req.user.clerkUserId` set by the `requireAuth` middleware.
 * @param res - The Express response object, used to send a 401 Unauthorized response if the Clerk user ID does not correspond to a user in the database, or a 500 Internal Server Error if there is a database error.
 * @param next - The next middleware function in the Express request handling chain, which will be called if the user is successfully looked up and attached to the request object.
 * @returns - If the Clerk user ID does not correspond to a user in the database, a 401 Unauthorized response is sent. If there is a database error, a 500 Internal Server Error response is sent. If the user is successfully looked up, the user's database record is attached to `req.user` and the next middleware function is called.
 */
export async function attachDatabaseUser(req: Request, res: Response, next: NextFunction) {
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
