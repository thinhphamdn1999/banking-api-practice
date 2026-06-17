import type { Request, Response } from 'express';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';
import HttpStatusCode from '@/common/constants/http-status-code';

import { BaseError } from '@/common/types/error';
import { FilterOptions } from '@/modules/bank-account/types/bank-account';
import { UserRole } from '@/modules/user/types/user';

import { createErrorResponse, sendInternalError } from '@/common/utils/error-response';

import { BankAccountApplicationService } from '@/modules/bank-account/v1/application/bank-account.application.v1.interface';

import {
  CreateBankAccountSchema,
  UpdateBankAccountSchema,
  toBankAccountDTO,
} from '@/modules/bank-account/v1/entry/bank-account.dto';

export class BankAccountController {
  constructor(private readonly bankAccountApplicationService: BankAccountApplicationService) {
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
        userId: role !== UserRole.ADMIN ? userId : (queryUserId as string | undefined),
      };

      const result = await this.bankAccountApplicationService.findBankAccounts(
        {
          page: page ? Number(req.query.page) : DEFAULT_PAGINATION_PAGE,
          limit: limit ? Number(req.query.limit) : DEFAULT_PAGINATION_LIMIT_ITEM,
        },
        filter,
      );
      return res.status(HttpStatusCode.OK).json({
        data: result.data.map(toBankAccountDTO),
        metadata: result.metadata,
      });
    } catch {
      return sendInternalError(res, 'Failed to fetch bank account list');
    }
  }

  async getBankAccountById(req: Request, res: Response) {
    try {
      const { id: userId, role } = req.user ?? {};
      const bankAccount = await this.bankAccountApplicationService.getBankAccountById(
        req.params.id as string,
        role !== UserRole.ADMIN ? userId : undefined,
      );

      return res.status(HttpStatusCode.OK).json(toBankAccountDTO(bankAccount));
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.BANK_ACCOUNT_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.BANK_ACCOUNT_NOT_FOUND,
                message: 'Can not find any bank account',
              },
            ],
          }),
        );
      }
      return sendInternalError(res, 'Failed to fetch a bank account');
    }
  }

  async createBankAccount(req: Request, res: Response) {
    const parsed = CreateBankAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HttpStatusCode.BAD_REQUEST).json(
        createErrorResponse({
          statusCode: HttpStatusCode.BAD_REQUEST,
          errors: parsed.error.issues.map((issue) => ({
            errCode: ERROR_CODES.INVALID_REQUEST,
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }),
      );
    }

    try {
      const { id: userId } = req.user ?? {};
      const bankAccount = await this.bankAccountApplicationService.createBankAccount({
        name: parsed.data.name,
        userId: userId as string,
      });

      return res.status(HttpStatusCode.CREATED).json(toBankAccountDTO(bankAccount));
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.USER_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [{ errCode: ERROR_CODES.USER_NOT_FOUND, message: 'Can not find any user' }],
          }),
        );
      }
      return sendInternalError(res, 'Failed to create a bank account');
    }
  }

  async updateBankAccount(req: Request, res: Response) {
    const parsed = UpdateBankAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HttpStatusCode.BAD_REQUEST).json(
        createErrorResponse({
          statusCode: HttpStatusCode.BAD_REQUEST,
          errors: parsed.error.issues.map((issue) => ({
            errCode: ERROR_CODES.INVALID_REQUEST,
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }),
      );
    }

    try {
      const bankAccountId = req.params.id;
      const { id: userId } = req.user ?? {};

      const bankAccount = await this.bankAccountApplicationService.updateBankAccount({
        name: parsed.data.name,
        userId: userId as string,
        bankAccountId: bankAccountId as string,
      });

      return res.status(HttpStatusCode.OK).json(toBankAccountDTO(bankAccount!));
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        if (error.message === ERROR_CODES.USER_NOT_FOUND) {
          return res.status(HttpStatusCode.NOT_FOUND).json(
            createErrorResponse({
              statusCode: HttpStatusCode.NOT_FOUND,
              errors: [{ errCode: ERROR_CODES.USER_NOT_FOUND, message: 'Can not find any user' }],
            }),
          );
        }
        if (error.message === ERROR_CODES.BANK_ACCOUNT_NOT_FOUND) {
          return res.status(HttpStatusCode.NOT_FOUND).json(
            createErrorResponse({
              statusCode: HttpStatusCode.NOT_FOUND,
              errors: [
                {
                  errCode: ERROR_CODES.BANK_ACCOUNT_NOT_FOUND,
                  message: 'Can not find any bank account',
                },
              ],
            }),
          );
        }
      }
      return sendInternalError(res, 'Failed to update a bank account');
    }
  }
}
