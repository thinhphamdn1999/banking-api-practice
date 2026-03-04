import type { Request, Response } from 'express';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { BaseError } from '@/common/types/error';
import { createErrorResponse, sendInternalError } from '@/common/utils/error-response';

import { UserApplicationService } from '@/modules/user/application/user.application';

export class UserController {
  constructor(private readonly userService: UserApplicationService) {
    this.getUsers = this.getUsers.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.deActiveUser = this.deActiveUser.bind(this);
    this.activateUser = this.activateUser.bind(this);
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(req.user!.id as string);
      return res.status(HttpStatusCode.OK).json(user);
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.USER_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [{ errCode: ERROR_CODES.USER_NOT_FOUND, message: 'Can not find user' }],
          }),
        );
      }
      return sendInternalError(res, 'Failed to fetch current user');
    }
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
      return res.status(HttpStatusCode.OK).json(result);
    } catch {
      return sendInternalError(res, 'Failed to fetch user list');
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(req.params.id as string);
      return res.status(HttpStatusCode.OK).json(user);
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.USER_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [{ errCode: ERROR_CODES.USER_NOT_FOUND, message: 'Can not find user' }],
          }),
        );
      }
      return sendInternalError(res, 'Failed to fetch a user');
    }
  }

  async deActiveUser(req: Request, res: Response) {
    try {
      const user = await this.userService.deActiveUser(req.params.id as string);
      return res.status(HttpStatusCode.OK).json(user);
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.USER_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [{ errCode: ERROR_CODES.USER_NOT_FOUND, message: 'Can not find user' }],
          }),
        );
      }
      return sendInternalError(res, 'Failed to de active user');
    }
  }

  async activateUser(req: Request, res: Response) {
    try {
      const user = await this.userService.activateUser(req.params.id as string);
      return res.status(HttpStatusCode.OK).json(user);
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.USER_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [{ errCode: ERROR_CODES.USER_NOT_FOUND, message: 'Can not find user' }],
          }),
        );
      }
      return sendInternalError(res, 'Failed to activate user');
    }
  }
}
