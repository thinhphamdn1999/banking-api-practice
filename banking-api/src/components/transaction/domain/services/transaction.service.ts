import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';
import { ERROR_CODES } from '@/common/constants/errors';

import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions } from '@/components/transaction/types/transaction';

import { Transaction } from '@/components/transaction/domain/entities/transaction.entity';
import { TransactionRepository } from '@/components/transaction/domain/repository/transaction.repository';

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async findTransactions(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT,
    },
    filter?: FilterOptions,
  ) {
    const transaction = await this.transactionRepository.findTransactions(pagination, filter);

    return { data: transaction };
  }

  async getTransactionById(transactionId: string) {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    return { data: transaction };
  }

  async createTransaction(input: Partial<Transaction>) {
    const newTransaction = await this.transactionRepository.create(input);
    return { data: newTransaction };
  }

  async updateTransaction(transactionId: string, input: Partial<Transaction>) {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    const updatedTransaction = await this.transactionRepository.update(input, transactionId);
    return { data: updatedTransaction };
  }
}
