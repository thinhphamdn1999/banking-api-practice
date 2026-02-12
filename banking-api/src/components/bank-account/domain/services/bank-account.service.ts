import { PaginationOptions } from '@/common/types/pagination';
import { FilterOptions } from '@/components/bank-account/types/bank-account';

import { ERROR_CODES } from '@/common/constants/errors';
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from '@/common/constants/pagination';

import { BankAccountRepository } from '@/components/bank-account/domain/repository/bank-account-repository';
import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';

export class BankAccountService {
  constructor(private readonly bankAccountRepository: BankAccountRepository) {}

  async findUsers(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT,
    },
    filter?: FilterOptions,
  ) {
    const bankAccounts = await this.bankAccountRepository.findBankAccounts(pagination, filter);

    return { data: bankAccounts };
  }

  async getBankAccountById(bankAccountId: string) {
    const bankAccount = await this.bankAccountRepository.findById(bankAccountId);
    if (!bankAccount) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    return { data: bankAccount };
  }

  async createBankAccount(input: Partial<BankAccount>) {
    const newBankAccount = await this.bankAccountRepository.create(input);
    return { data: newBankAccount };
  }

  async updateBankAccount(userId: string, input: Partial<BankAccount>) {
    const bankAccount = await this.bankAccountRepository.findById(userId);
    if (!bankAccount) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    const updatedBankAccount = await this.bankAccountRepository.update(input, userId);
    return { data: updatedBankAccount };
  }
}
