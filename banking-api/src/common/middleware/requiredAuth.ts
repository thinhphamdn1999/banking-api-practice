import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/httpStatusCode';
import { ERROR_CODES } from '@/common/constants/errors';

import { createErrorResponse } from '@/common/utils/errorResponse';

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

  next();
}
