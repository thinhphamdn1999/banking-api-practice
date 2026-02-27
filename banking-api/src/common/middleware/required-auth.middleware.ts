import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';

import { createErrorResponse } from '@/common/utils/error-response';

/**
 * Middleware to enforce that the request is authenticated with a valid Clerk session.
 * @param req - The Express request object, which is expected to have a `user` property set by the `attachDatabaseUser` middleware if the user is authenticated.
 * @param res - The Express response object, used to send a 401 Unauthorized response if the user is not authenticated.
 * @param next - The next middleware function in the Express request handling chain, which will be called if the user is authenticated successfully.
 * @returns - If the user is not authenticated, a 401 Unauthorized response is sent. If the user is authenticated, the `user` property is set on the request object with the user's Clerk ID and the next middleware function is called.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json(
      createErrorResponse({
        statusCode: HttpStatusCode.UNAUTHORIZED,
        errors: [
          {
            errCode: ERROR_CODES.UNAUTHENTICATED,
            message: 'Missing or invalid access token',
          },
        ],
      }),
    );
  }

  req.user = { clerkUserId: userId };

  next();
}
