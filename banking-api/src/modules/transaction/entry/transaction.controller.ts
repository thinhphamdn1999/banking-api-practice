import { Request, Response } from 'express';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';
import HttpStatusCode from '@/common/constants/http-status-code';
import { SortOrder } from '@/common/constants/filter-parameter';

import { BaseError } from '@/common/types/error';
import {
  FilterOptions,
  TransactionStatus,
  TransactionType,
} from '@/modules/transaction/types/transaction';
import { UserRole } from '@/modules/user/types/user';

import { createErrorResponse, sendInternalError } from '@/common/utils/error-response';

import { TransactionApplicationService } from '@/modules/transaction/application/transaction.application';

import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  toTransactionDTO,
} from '@/modules/transaction/entry/transaction.dto';

export class TransactionController {
  constructor(private readonly transactionService: TransactionApplicationService) {
    this.getTransactions = this.getTransactions.bind(this);
    this.getTransactionById = this.getTransactionById.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.updateTransaction = this.updateTransaction.bind(this);
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const { page, limit, type, status, fromDate, toDate, bankAccountIds, sortBy, orderBy } =
        req.query;
      const { id: userId, role } = req.user ?? {};

      const normalizedBankAccountIds = Array.isArray(bankAccountIds)
        ? bankAccountIds
        : bankAccountIds
          ? [bankAccountIds]
          : [];

      const filters: FilterOptions = {
        type: type as TransactionType,
        status: status as TransactionStatus,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
        bankAccountIds: normalizedBankAccountIds as string[],
        sortBy: sortBy as string,
        orderBy: orderBy as SortOrder,
      };

      const result = await this.transactionService.findTransactions(
        {
          page: page ? Number(page) : DEFAULT_PAGINATION_PAGE,
          limit: limit ? Number(limit) : DEFAULT_PAGINATION_LIMIT_ITEM,
        },
        filters,
        userId,
        role === UserRole.ADMIN,
      );

      return res.status(HttpStatusCode.OK).json({
        data: result.data.map(toTransactionDTO),
        metadata: result.metadata,
      });
    } catch {
      return sendInternalError(res, 'Failed to fetch transaction list');
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id: userId, role } = req.user ?? {};

      const transaction = await this.transactionService.getTransactionById(
        req.params.id as string,
        userId as string,
        role === UserRole.ADMIN,
      );

      return res.status(HttpStatusCode.OK).json(toTransactionDTO(transaction));
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.TRANSACTION_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.TRANSACTION_NOT_FOUND,
                message: 'Can not find any transaction',
              },
            ],
          }),
        );
      }
      return sendInternalError(res, 'Failed to fetch a transaction');
    }
  }

  async createTransaction(req: Request, res: Response) {
    const parsed = CreateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HttpStatusCode.BAD_REQUEST).json(
        createErrorResponse({
          statusCode: HttpStatusCode.BAD_REQUEST,
          errors: parsed.error.issues.map((issue) => ({
            errCode: ERROR_CODES.INVALID_REQUEST,
            field: ['transaction', ...issue.path].join('.'),
            message: issue.message,
          })),
        }),
      );
    }

    try {
      const { type, amount, idempotencyKey, description } = parsed.data;
      const sourceAccountId =
        'sourceAccountId' in parsed.data ? parsed.data.sourceAccountId : undefined;
      const destinationAccountId =
        'destinationAccountId' in parsed.data ? parsed.data.destinationAccountId : undefined;

      const transaction = await this.transactionService.createTransaction({
        type,
        amount,
        idempotencyKey,
        description,
        sourceAccountId,
        destinationAccountId,
      });

      return res.status(HttpStatusCode.CREATED).json(toTransactionDTO(transaction));
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        if (error.message === ERROR_CODES.INVALID_AMOUNT) {
          return res.status(HttpStatusCode.BAD_REQUEST).json(
            createErrorResponse({
              statusCode: HttpStatusCode.BAD_REQUEST,
              errors: [
                {
                  errCode: ERROR_CODES.INVALID_AMOUNT,
                  field: 'transaction.amount',
                  message: 'Amount must be larger than 0',
                },
              ],
            }),
          );
        }

        if (error.message === ERROR_CODES.INSUFFICIENT_BALANCE) {
          return res.status(HttpStatusCode.BAD_REQUEST).json(
            createErrorResponse({
              statusCode: HttpStatusCode.BAD_REQUEST,
              errors: [
                {
                  errCode: ERROR_CODES.INSUFFICIENT_BALANCE,
                  field: 'transaction.amount',
                  message: 'Amount exceed balance',
                },
              ],
            }),
          );
        }

        if (error.message === ERROR_CODES.DESTINATION_ACCOUNT_NOT_FOUND) {
          return res.status(HttpStatusCode.BAD_REQUEST).json(
            createErrorResponse({
              statusCode: HttpStatusCode.BAD_REQUEST,
              errors: [
                {
                  errCode: ERROR_CODES.DESTINATION_ACCOUNT_NOT_FOUND,
                  field: 'transaction.destinationAccountId',
                  message: 'Can not found the bank account with destinationAccountId',
                },
              ],
            }),
          );
        }

        if (error.message === ERROR_CODES.SOURCE_ACCOUNT_NOT_FOUND) {
          return res.status(HttpStatusCode.BAD_REQUEST).json(
            createErrorResponse({
              statusCode: HttpStatusCode.BAD_REQUEST,
              errors: [
                {
                  errCode: ERROR_CODES.SOURCE_ACCOUNT_NOT_FOUND,
                  field: 'transaction.sourceAccountId',
                  message: 'Can not found the bank account with sourceAccountId',
                },
              ],
            }),
          );
        }
      }

      return sendInternalError(res, 'Failed to create a transaction');
    }
  }

  async updateTransaction(req: Request, res: Response) {
    const parsed = UpdateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HttpStatusCode.BAD_REQUEST).json(
        createErrorResponse({
          statusCode: HttpStatusCode.BAD_REQUEST,
          errors: parsed.error.issues.map((issue) => ({
            errCode: ERROR_CODES.INVALID_REQUEST,
            field: ['transaction', ...issue.path].join('.'),
            message: issue.message,
          })),
        }),
      );
    }

    try {
      const transactionId = req.params.id;
      const { id: userId, role } = req.user ?? {};

      const transaction = await this.transactionService.updateTransaction(
        transactionId as string,
        { description: parsed.data.description },
        userId as string,
        role === UserRole.ADMIN,
      );

      return res.status(HttpStatusCode.OK).json(toTransactionDTO(transaction));
    } catch (error: unknown) {
      if (error instanceof BaseError && error.message === ERROR_CODES.TRANSACTION_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.TRANSACTION_NOT_FOUND,
                message: 'Can not find any transaction',
              },
            ],
          }),
        );
      }
      return sendInternalError(res, 'Failed to update a transaction');
    }
  }
}
