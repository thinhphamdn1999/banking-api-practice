import { DeepPartial, EntityManager } from 'typeorm';

import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';
import { ERROR_CODES } from '@/common/constants/error';

import { BaseError } from '@/common/types/error';
import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions, UpdateTransactionInput } from '@/modules/transaction/types/transaction';

import { TransactionRepository } from '@/modules/transaction/domain/repository/transaction.repository';
import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async findTransactions(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT_ITEM,
    },
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ) {
    return this.transactionRepository.findTransactions(pagination, filter, userId, isAdmin);
  }

  async getTransactionById(transactionId: string, userId: string, isAdmin: boolean) {
    const transaction = await this.transactionRepository.findByIdWithRelation(
      transactionId,
      userId,
      isAdmin,
    );

    if (!transaction) {
      throw new BaseError({ message: ERROR_CODES.TRANSACTION_NOT_FOUND });
    }

    return transaction;
  }

  async findByIdempotencyKey(idempotencyKey: string, manager?: EntityManager) {
    return this.transactionRepository.findByIdempotencyKey(idempotencyKey, manager);
  }

  async createTransaction(data: DeepPartial<Transaction>, manager?: EntityManager) {
    return this.transactionRepository.create(data, manager);
  }

  async updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
    userId: string,
    isAdmin: boolean,
  ) {
    const transaction = await this.transactionRepository.findByIdWithRelation(
      transactionId,
      userId,
      isAdmin,
    );

    if (!transaction) {
      throw new BaseError({ message: ERROR_CODES.TRANSACTION_NOT_FOUND });
    }

    return (await this.transactionRepository.updateAndGetTransactionWithRelation(
      input,
      transactionId,
    ))!;
  }
}
