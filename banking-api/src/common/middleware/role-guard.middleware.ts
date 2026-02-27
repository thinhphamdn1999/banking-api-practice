import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';

import type { UserRole } from '@/components/user/types/user';

import { createErrorResponse } from '@/common/utils/error-response';

/**
 * Middleware to enforce that the authenticated user has one of the specified roles.
 * @param roles - One or more user roles that are allowed to access the route. If the authenticated user's role is not included in this list, a 403 Forbidden response will be returned.
 * @returns - An Express middleware function that checks the user's role and either calls `next()` to proceed or returns a 403 response if the user does not have the required role.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(HttpStatusCode.FORBIDDEN).json(
        createErrorResponse({
          statusCode: HttpStatusCode.FORBIDDEN,
          errors: [
            {
              errCode: ERROR_CODES.FORBIDDEN,
              message: 'You do not have permission to perform this action',
            },
          ],
        }),
      );
    }

    next();
  };
}
