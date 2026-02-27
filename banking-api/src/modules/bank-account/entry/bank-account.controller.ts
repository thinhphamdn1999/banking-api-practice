import type { Request, Response } from 'express';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';
import HttpStatusCode from '@/common/constants/http-status-code';

import { FilterOptions } from '@/modules/bank-account/types/bank-account';
import { UserRole } from '@/modules/user/types/user';

import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';

import { createErrorResponse } from '@/common/utils/error-response';

export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {
    this.getBankAccounts = this.getBankAccounts.bind(this);
    this.getBankAccountById = this.getBankAccountById.bind(this);
    this.createBankAccount = this.createBankAccount.bind(this);
    this.updateBankAccount = this.updateBankAccount.bind(this);
  }

  async getBankAccounts(req: Request, res: Response) {
    try {
      const { page, limit, userId: queryUserId } = req.query;
      const { id: userId, role } = req.user ?? {};

      const filter: FilterOptions = {
        // Non-admin: always scoped to their own accounts.
        // Admin: optionally filter by a specific userId passed in the query string.
        userId: role !== UserRole.ADMIN ? userId : (queryUserId as string | undefined),
      };

      const result = await this.bankAccountService.findBankAccounts(
        {
          page: page ? Number(req.query.page) : DEFAULT_PAGINATION_PAGE,
          limit: limit ? Number(req.query.limit) : DEFAULT_PAGINATION_LIMIT_ITEM,
        },
        filter,
      );
      return res.status(HttpStatusCode.OK).json(result.data);
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          errors: [
            {
              errCode: ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Failed to fetch bank account list',
            },
          ],
        }),
      );
    }
  }

  async getBankAccountById(req: Request, res: Response) {
    try {
      const { id: userId, role } = req.user ?? {};
      const result = await this.bankAccountService.getBankAccountById(
        req.params.id as string,
        role !== UserRole.ADMIN ? userId : undefined,
      );

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find any bank account',
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
              message: 'Failed to fetch a bank account',
            },
          ],
        }),
      );
    }
  }

  async createBankAccount(req: Request, res: Response) {
    try {
      const { id: userId } = req.user ?? {};
      const { name } = req.body;

      if (!name) {
        return res.status(HttpStatusCode.BAD_REQUEST).json(
          createErrorResponse({
            statusCode: HttpStatusCode.BAD_REQUEST,
            errors: [
              {
                errCode: ERROR_CODES.INVALID_REQUEST,
                field: 'bankAccount.name',
                message: 'Bank account name is required',
              },
            ],
          }),
        );
      }

      const result = await this.bankAccountService.createBankAccount({
        name,
        userId: userId as string,
      });

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find any user',
              },
            ],
          }),
        );
      }

      return res.status(HttpStatusCode.CREATED).json(result.data);
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          errors: [
            {
              errCode: ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Failed to create a bank account',
            },
          ],
        }),
      );
    }
  }

  async updateBankAccount(req: Request, res: Response) {
    try {
      const bankAccountId = req.params.id;
      const { name } = req.body;
      const { id: userId } = req.user ?? {};

      if (!name) {
        return res.status(HttpStatusCode.BAD_REQUEST).json(
          createErrorResponse({
            statusCode: HttpStatusCode.BAD_REQUEST,
            errors: [
              {
                errCode: ERROR_CODES.INVALID_REQUEST,
                field: 'bankAccount.name',
                message: 'Bank account name is required',
              },
            ],
          }),
        );
      }

      const result = await this.bankAccountService.updateBankAccount({
        name,
        userId: userId as string,
        bankAccountId: bankAccountId as string,
      });

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find any bank account',
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
              message: 'Failed to update a bank account',
            },
          ],
        }),
      );
    }
  }
}
