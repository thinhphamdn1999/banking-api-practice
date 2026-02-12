import type { Request, Response } from 'express';

import HttpStatusCode from '@/common/constants/httpStatusCode';
import { ERROR_CODES } from '@/common/constants/errors';
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';

import { UserService } from '@/components/user/domain/services/user.service';

import { createErrorResponse } from '@/common/utils/errorResponse';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getUsers = async (req: Request, res: Response) => {
    try {
      const { page, limit } = req.query;

      const result = await this.userService.findUsers(
        {
          page: page ? Number(req.query.page) : DEFAULT_PAGINATION_PAGE,
          limit: limit ? Number(req.query.limit) : DEFAULT_PAGINATION_LIMIT,
        },
        req.query,
      );
      res.status(HttpStatusCode.OK).json(result.data);
    } catch (error) {
      console.log(error);

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

  getUserById = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.getUserById(req.params.id as string);

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        res.status(HttpStatusCode.NOT_FOUND).json(
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

        return;
      }
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

  deActiveUser = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.getUserById(req.params.id as string);

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        res.status(HttpStatusCode.NOT_FOUND).json(
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

        return;
      }

      const updatedUser = await this.userService.deActiveUser(result.data?.id as string);

      res.status(HttpStatusCode.OK).json(updatedUser.data);
    } catch (error) {
      console.log(error);

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
}
