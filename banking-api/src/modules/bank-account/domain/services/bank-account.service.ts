import { DeepPartial, EntityManager } from 'typeorm';

import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions, UpdateBankAccountInput } from '@/modules/bank-account/types/bank-account';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { BaseError } from '@/common/types/error';

import { BankAccountRepository } from '@/modules/bank-account/domain/repository/bank-account.repository';
import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';

export class BankAccountService {
  constructor(private readonly bankAccountRepository: BankAccountRepository) {}

  async findBankAccounts(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT_ITEM,
    },
    filter?: FilterOptions,
  ) {
    return this.bankAccountRepository.findBankAccounts(pagination, filter);
  }

  async getBankAccountById(bankAccountId: string, userId?: string) {
    const bankAccount = userId
      ? await this.bankAccountRepository.findBankAccountByUserIdAndBankId(userId, bankAccountId)
      : await this.bankAccountRepository.findById(bankAccountId);

    if (!bankAccount) {
      throw new BaseError({ message: ERROR_CODES.BANK_ACCOUNT_NOT_FOUND });
    }

    return bankAccount;
  }

  async findByAccountNumber(accountNumber: string) {
    return this.bankAccountRepository.findByAccountNumber(accountNumber);
  }

  async createBankAccount(data: DeepPartial<BankAccount>) {
    return await this.bankAccountRepository.create(data);
  }

  async debitAccount(accountId: string, amount: number, manager: EntityManager) {
    const account = await this.bankAccountRepository.findByIdWithLock(accountId, manager);

    if (!account) {
      throw new BaseError({ message: ERROR_CODES.SOURCE_ACCOUNT_NOT_FOUND });
    }

    if (account.balance < amount) {
      throw new BaseError({ message: ERROR_CODES.INSUFFICIENT_BALANCE });
    }

    account.balance -= amount;
    await this.bankAccountRepository.save(account, manager);

    return account;
  }

  async creditAccount(accountId: string, amount: number, manager: EntityManager) {
    const account = await this.bankAccountRepository.findByIdWithLock(accountId, manager);

    if (!account) {
      throw new BaseError({ message: ERROR_CODES.DESTINATION_ACCOUNT_NOT_FOUND });
    }

    account.balance += amount;
    await this.bankAccountRepository.save(account, manager);

    return account;
  }

  async updateBankAccount({ name, bankAccountId }: UpdateBankAccountInput) {
    return await this.bankAccountRepository.update({ name }, bankAccountId);
  }
}
