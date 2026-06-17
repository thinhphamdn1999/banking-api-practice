import { DataSource } from 'typeorm';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { BaseError } from '@/common/types/error';
import { PaginationOptions } from '@/common/types/pagination';
import {
  FilterOptions,
  TransactionStatus,
  UpdateTransactionInput,
} from '@/modules/transaction/types/transaction';

import { resolveTransactionName } from '@/modules/transaction/utils/transaction';

import { TransactionService } from '@/modules/transaction/domain/services/transaction.service';
import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';

import {
  CreateTransactionInput,
  TransactionApplicationService,
} from '@/modules/transaction/v1/application/transaction.application.v1.interface';

export class TransactionApplicationServiceV1 implements TransactionApplicationService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly bankAccountService: BankAccountService,
    private readonly dataSource: DataSource,
  ) {}

  async findTransactions(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT_ITEM,
    },
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ) {
    return this.transactionService.findTransactions(pagination, filter, userId, isAdmin);
  }

  async getTransactionById(transactionId: string, userId: string, isAdmin: boolean) {
    return this.transactionService.getTransactionById(transactionId, userId, isAdmin);
  }

  async updateTransaction(
    transactionId: string,
    input: UpdateTransactionInput,
    userId: string,
    isAdmin: boolean,
  ) {
    return this.transactionService.updateTransaction(transactionId, input, userId, isAdmin);
  }

  async createTransaction(input: CreateTransactionInput) {
    const isInvalidAmount =
      !input.amount || !Number.isFinite(input.amount.amount) || input.amount.amount <= 0;

    if (isInvalidAmount) {
      throw new BaseError({ message: ERROR_CODES.INVALID_AMOUNT });
    }

    return this.dataSource.transaction(async (manager) => {
      const existing = await this.transactionService.findByIdempotencyKey(
        input.idempotencyKey,
        manager,
      );

      if (existing) {
        return existing;
      }

      let fromAccount = null;
      let toAccount = null;

      if (input.sourceAccountId) {
        fromAccount = await this.bankAccountService.debitAccount(
          input.sourceAccountId,
          input.amount.amount,
          manager,
        );
      }

      if (input.destinationAccountId) {
        toAccount = await this.bankAccountService.creditAccount(
          input.destinationAccountId,
          input.amount.amount,
          manager,
        );
      }

      const name = resolveTransactionName(input.type, fromAccount?.name, toAccount?.name);

      return this.transactionService.createTransaction(
        {
          name,
          type: input.type,
          amount: input.amount.amount.toString(),
          currency: input.amount.currency,
          idempotencyKey: input.idempotencyKey,
          fromAccount: fromAccount ?? undefined,
          toAccount: toAccount ?? undefined,
          fromAccountBalance: fromAccount !== null ? fromAccount.balance.toString() : null,
          toAccountBalance: toAccount !== null ? toAccount.balance.toString() : null,
          description: input.description,
          status: TransactionStatus.SUCCESS,
        },
        manager,
      );
    });
  }
}
