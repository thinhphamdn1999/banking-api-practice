import type { Request, Response } from 'express';

import HttpStatusCode from '@/common/constants/httpStatusCode';
import { ERROR_CODES } from '@/common/constants/errors';

import { findUsers as findUsersService } from '@/components/user/domain/user.service';

import { createErrorResponse } from '@/common/utils/errorResponse';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await findUsersService();
    res.status(HttpStatusCode.OK).json(result.data);
  } catch {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
      createErrorResponse({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        errors: [
          {
            errCode: ERROR_CODES.GENERAL_EXCEPTION,
            message: 'Failed to fetch user list',
          },
        ],
      }),
    );
  }
};
