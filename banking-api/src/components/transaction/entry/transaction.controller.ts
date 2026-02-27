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
} from '@/components/transaction/types/transaction';
import { Transaction } from '@/components/transaction/domain/entities/transaction.entity';
import { UserRole } from '@/components/user/types/user';

import { TransactionService } from '@/components/transaction/domain/services/transaction.service';

import { transactionMapper } from '@/components/transaction/entry/transaction.mapper';

import { createErrorResponse, getInvalidErrorList } from '@/common/utils/error-response';

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {
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
        data: result.data.data.map((transaction) => transactionMapper(transaction)),
        metadata: result.data.metadata,
      });
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          errors: [
            {
              errCode: ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Failed to fetch transaction list',
            },
          ],
        }),
      );
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id: userId, role } = req.user ?? {};

      const result = await this.transactionService.getTransactionById(
        req.params.id as string,
        userId as string,
        role === UserRole.ADMIN,
      );

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find any transaction',
              },
            ],
          }),
        );
      }

      return res.status(HttpStatusCode.OK).json(transactionMapper(result.data as Transaction));
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          errors: [
            {
              errCode: ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Failed to fetch a transaction',
            },
          ],
        }),
      );
    }
  }

  async createTransaction(req: Request, res: Response) {
    try {
      const { type, amount, sourceAccountId, destinationAccountId, description, idempotencyKey } =
        req.body;

      const errorList = [];

      switch (type) {
        case TransactionType.DEPOSIT:
          if (!destinationAccountId) {
            errorList.push({
              property: 'destinationAccountId',
              description: 'destinationAccountId is required for deposit money',
            });
          }
          break;
        case TransactionType.WITHDRAW:
          if (!sourceAccountId) {
            errorList.push({
              property: 'sourceAccountId',
              description: 'sourceAccountId is required for withdraw money',
            });
          }
          break;
        case TransactionType.TRANSFER:
          if (!destinationAccountId) {
            errorList.push({
              property: 'destinationAccountId',
              description: 'destinationAccountId is required for transfer money',
            });
          }
          if (!sourceAccountId) {
            errorList.push({
              property: 'sourceAccountId',
              description: 'sourceAccountId is required for transfer money',
            });
          }
          break;
        default:
          errorList.push({
            property: 'type',
            description: 'Transaction type is one of deposit, withdraw, transfer',
          });
      }

      if (!idempotencyKey) {
        errorList.push({
          property: 'idempotencyKey',
          description: 'idempotencyKey is required for create a transaction',
        });
      }

      if (errorList.length > 0) {
        return res.status(HttpStatusCode.BAD_REQUEST).json(
          createErrorResponse({
            statusCode: HttpStatusCode.BAD_REQUEST,
            errors: getInvalidErrorList({ prefix: 'transaction', properties: errorList }),
          }),
        );
      }

      const result = await this.transactionService.createTransaction({
        amount,
        idempotencyKey,
        type,
        description,
        destinationAccountId,
        sourceAccountId,
      });

      return res.status(HttpStatusCode.CREATED).json(transactionMapper(result.data as Transaction));
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

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          errors: [
            {
              errCode: ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Failed to create a transaction',
            },
          ],
        }),
      );
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const transactionId = req.params.id;
      const { description } = req.body;
      const { id: userId, role } = req.user ?? {};

      const result = await this.transactionService.updateTransaction(
        transactionId as string,
        {
          description,
        },
        userId as string,
        role === UserRole.ADMIN,
      );

      if (result.error === ERROR_CODES.ITEM_NOT_FOUND) {
        return res.status(HttpStatusCode.NOT_FOUND).json(
          createErrorResponse({
            statusCode: HttpStatusCode.NOT_FOUND,
            errors: [
              {
                errCode: ERROR_CODES.ITEM_NOT_FOUND,
                message: 'Can not find any transaction',
              },
            ],
          }),
        );
      }

      return res.status(HttpStatusCode.OK).json(transactionMapper(result.data as Transaction));
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          errors: [
            {
              errCode: ERROR_CODES.GENERAL_EXCEPTION,
              message: 'Failed to update a transaction',
            },
          ],
        }),
      );
    }
  }
}
