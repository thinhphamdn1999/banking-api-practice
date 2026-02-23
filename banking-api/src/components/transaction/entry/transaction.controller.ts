import { Request, Response } from 'express';

import { TransactionService } from '../domain/services/transaction.service';
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';
import HttpStatusCode from '@/common/constants/httpStatusCode';
import { createErrorResponse, getInvalidErrorList } from '@/common/utils/errorResponse';
import { ERROR_CODES } from '@/common/constants/errors';
import { TransactionType } from '../types/transaction';
import { BaseError } from '@/common/types/error';

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {
    this.getTransactions = this.getTransactions.bind(this);
    this.getTransactionById = this.getTransactionById.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.updateTransaction = this.updateTransaction.bind(this);
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;

      const result = await this.transactionService.findTransactions(
        {
          page: page ? Number(req.query.page) : DEFAULT_PAGINATION_PAGE,
          limit: limit ? Number(req.query.limit) : DEFAULT_PAGINATION_LIMIT,
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
              message: 'Failed to fetch transaction list',
            },
          ],
        }),
      );
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const result = await this.transactionService.getTransactionById(req.params.id as string);

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

      return res.status(HttpStatusCode.OK).json(result.data);
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

      return res.status(HttpStatusCode.CREATED).json(result.data);
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
                  field: 'transaction.sourceAccountId',
                  message: 'Can not found the bank account with sourceAccountId',
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
                  errCode: ERROR_CODES.DESTINATION_ACCOUNT_NOT_FOUND,
                  field: 'transaction.sourceAccountId',
                  message: 'Can not found the bank account with sourceAccountId',
                },
              ],
            }),
          );
        }
      }

      console.log(error);

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

      const result = await this.transactionService.updateTransaction(transactionId as string, {
        description,
      });

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

      return res.status(HttpStatusCode.OK).json(result.data);
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
