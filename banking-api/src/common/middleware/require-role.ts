import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/errors';
import { createErrorResponse } from '@/common/utils/error-response';
import type { UserRole } from '@/components/user/types/user';

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
