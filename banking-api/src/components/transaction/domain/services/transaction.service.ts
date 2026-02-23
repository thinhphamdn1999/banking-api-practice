import { DataSource } from 'typeorm';

import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';
import { ERROR_CODES } from '@/common/constants/errors';

import { PaginationOptions } from '@/common/types/pagination';
import {
  CreateTransactionInput,
  FilterOptions,
  TransactionType,
  UpdateTransactionInput,
} from '@/components/transaction/types/transaction';

import { TransactionRepository } from '@/components/transaction/domain/repository/transaction.repository';
import { BankAccountRepository } from '@/components/bank-account/domain/repository/bank-account-repository';
import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';
import { BaseError } from '@/common/types/error';

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly dataSource: DataSource,
  ) {}

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
    const transaction = await this.transactionRepository.findByIdWithRelation(transactionId);
    if (!transaction) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    return { data: transaction };
  }

  async createTransaction(input: CreateTransactionInput) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await this.transactionRepository.findByIdempotencyKey(
        input.idempotencyKey,
        manager,
      );

      if (existing) {
        return { data: existing };
      }

      const isInvalidAmount =
        !input.amount || !Number.isFinite(input.amount.amount) || input.amount.amount <= 0;

      if (isInvalidAmount) {
        throw new BaseError({ message: ERROR_CODES.INVALID_AMOUNT });
      }

      let fromAccount: BankAccount | null = null;
      let toAccount: BankAccount | null = null;

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
      }

      let name = '';

      switch (input.type) {
        case TransactionType.DEPOSIT:
          name = `Deposit to ${toAccount?.name}`;
          break;
        case TransactionType.WITHDRAW:
          name = `Withdraw from ${fromAccount?.name}`;
          break;
        case TransactionType.TRANSFER:
          name = `Transfer to ${toAccount?.name}`;
          break;
        default:
          name = '';
      }

      const transaction = await this.transactionRepository.create(
        {
          name,
          type: input.type,
          amount: input.amount.amount.toString(),
          currency: input.amount.currency,
          idempotencyKey: input.idempotencyKey,
          fromAccount: fromAccount ? fromAccount : undefined,
          toAccount: toAccount ? toAccount : undefined,
          description: input.description,
        },
        manager,
      );

      return { data: transaction };
    });
  }

  async updateTransaction(transactionId: string, input: UpdateTransactionInput) {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    const updatedTransaction = await this.transactionRepository.update(input, transactionId);
    return { data: updatedTransaction };
  }
}
