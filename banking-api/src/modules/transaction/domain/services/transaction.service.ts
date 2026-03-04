import { DataSource } from 'typeorm';

import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';
import { ERROR_CODES } from '@/common/constants/error';

import { BaseError } from '@/common/types/error';
import { PaginationOptions } from '@/common/types/pagination';
import {
  CreateTransactionInput,
  FilterOptions,
  TransactionStatus,
  UpdateTransactionInput,
} from '@/modules/transaction/types/transaction';

import { resolveTransactionName } from '@/modules/transaction/utils/transaction';

import { TransactionRepository } from '@/modules/transaction/domain/repository/transaction.repository';
import { BankAccountRepository } from '@/modules/bank-account/domain/repository/bank-account.repository';
import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly bankAccountRepository: BankAccountRepository,
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
    const transaction = await this.transactionRepository.findTransactions(
      pagination,
      filter,
      userId,
      isAdmin,
    );

    return { data: transaction };
  }

  async getTransactionById(transactionId: string, userId: string, isAdmin: boolean) {
    const transaction = await this.transactionRepository.findByIdWithRelation(
      transactionId,
      userId,
      isAdmin,
    );
    if (!transaction) {
      return { error: ERROR_CODES.TRANSACTION_NOT_FOUND };
    }

    return { data: transaction };
  }

  async createTransaction(input: CreateTransactionInput) {
    return this.dataSource.transaction(async (manager) => {
      // Validate amount
      const isInvalidAmount =
        !input.amount || !Number.isFinite(input.amount.amount) || input.amount.amount <= 0;

      if (isInvalidAmount) {
        throw new BaseError({ message: ERROR_CODES.INVALID_AMOUNT });
      }

      // Check for existing transaction with the same idempotency key to ensure idempotency
      const existing = await this.transactionRepository.findByIdempotencyKey(
        input.idempotencyKey,
        manager,
      );

      if (existing) {
        return { data: existing };
      }

      let fromAccount: BankAccount | null = null;
      let toAccount: BankAccount | null = null;
      let fromAccountBalance: number | null = null;
      let toAccountBalance: number | null = null;

      if (input.sourceAccountId) {
        fromAccount = await this.bankAccountRepository.findByIdWithLock(
          input.sourceAccountId,
          manager,
        );

        if (!fromAccount) {
          throw new BaseError({ message: ERROR_CODES.SOURCE_ACCOUNT_NOT_FOUND });
        }

        if (fromAccount.balance < input.amount.amount) {
          throw new BaseError({ message: ERROR_CODES.INSUFFICIENT_BALANCE });
        }

        fromAccount.balance -= input.amount.amount;
        await this.bankAccountRepository.save(fromAccount, manager);
        fromAccountBalance = fromAccount.balance;
      }

      if (input.destinationAccountId) {
        toAccount = await this.bankAccountRepository.findByIdWithLock(
          input.destinationAccountId,
          manager,
        );

        if (!toAccount) {
          throw new BaseError({ message: ERROR_CODES.DESTINATION_ACCOUNT_NOT_FOUND });
        }

        toAccount.balance += input.amount.amount;
        await this.bankAccountRepository.save(toAccount, manager);
        toAccountBalance = toAccount.balance;
      }

      const name = resolveTransactionName(input.type, fromAccount?.name, toAccount?.name);

      const transaction = await this.transactionRepository.create(
        {
          name,
          type: input.type,
          amount: input.amount.amount.toString(),
          currency: input.amount.currency,
          idempotencyKey: input.idempotencyKey,
          fromAccount: fromAccount ? fromAccount : undefined,
          toAccount: toAccount ? toAccount : undefined,
          fromAccountBalance: fromAccountBalance !== null ? fromAccountBalance.toString() : null,
          toAccountBalance: toAccountBalance !== null ? toAccountBalance.toString() : null,
          description: input.description,
          status: TransactionStatus.SUCCESS,
        },
        manager,
      );

      return { data: transaction };
    });
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
      return { error: ERROR_CODES.TRANSACTION_NOT_FOUND };
    }

    const updatedTransaction = await this.transactionRepository.updateAndGetTransactionWithRelation(
      input,
      transactionId,
    );
    return { data: updatedTransaction };
  }
}
