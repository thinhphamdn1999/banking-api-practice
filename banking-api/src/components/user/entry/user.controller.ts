import type { Request, Response } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { UserService } from '@/components/user/domain/services/user.service';

import { createErrorResponse } from '@/common/utils/error-response';

export class UserController {
  constructor(private readonly userService: UserService) {
    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.deActiveUser = this.deActiveUser.bind(this);
  }

  async getUsers(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;

      const result = await this.userService.findUsers(
        {
          page: page ? Number(req.query.page) : DEFAULT_PAGINATION_PAGE,
          limit: limit ? Number(req.query.limit) : DEFAULT_PAGINATION_LIMIT_ITEM,
        },
        req.query,
      );
      return res.status(HttpStatusCode.OK).json(result.data);
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
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
  }

  async getUserById(req: Request, res: Response) {
    try {
      const result = await this.userService.getUserById(req.params.id as string);

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find user',
              },
            ],
          }),
        );
      }
      return res.status(HttpStatusCode.OK).json(result.data);
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
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
  }

  async deActiveUser(req: Request, res: Response) {
    try {
      const result = await this.userService.getUserById(req.params.id as string);

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find user',
              },
            ],
          }),
        );
      }

      const updatedUser = await this.userService.deActiveUser(result.data?.id as string);

      return res.status(HttpStatusCode.OK).json(updatedUser.data);
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
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
  }
}
