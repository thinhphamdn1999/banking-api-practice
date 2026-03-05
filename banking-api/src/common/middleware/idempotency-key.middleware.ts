import type { Request, Response, NextFunction } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';

import { createErrorResponse } from '@/common/utils/error-response';

export function requireIdempotencyKey(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res.status(HttpStatusCode.BAD_REQUEST).json(
      createErrorResponse({
        statusCode: HttpStatusCode.BAD_REQUEST,
        errors: [
          {
            errCode: ERROR_CODES.INVALID_REQUEST,
            field: 'Idempotency-Key',
            message: 'Idempotency-Key header is required',
          },
        ],
      }),
    );
  }

  next();
}
