import { PaginationOptions } from '@/common/types/pagination';
import {
  CreateBankAccountInput,
  FilterOptions,
  UpdateBankAccountInput,
} from '@/components/bank-account/types/bank-account';

import { ERROR_CODES } from '@/common/constants/error';
import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';

import { BankAccountRepository } from '@/components/bank-account/domain/repository/bank-account.repository';
import { UserRepository } from '@/components/user/domain/repository/user.repository';

export class BankAccountService {
  constructor(
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private async generateUniqueAccountNumber(): Promise<string> {
    while (true) {
      const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const exists = await this.bankAccountRepository.findByAccountNumber(number);
      if (!exists) return number;
    }
  }

  async findBankAccounts(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT_ITEM,
    },
    filter?: FilterOptions,
  ) {
    const bankAccounts = await this.bankAccountRepository.findBankAccounts(pagination, filter);

    return { data: bankAccounts };
  }

  async getBankAccountById(bankAccountId: string, userId?: string) {
    const bankAccount = userId
      ? await this.bankAccountRepository.findBankAccountByUserIdAndBankId(userId, bankAccountId)
      : await this.bankAccountRepository.findById(bankAccountId);

    if (!bankAccount) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    return { data: bankAccount };
  }

  async createBankAccount({ name, userId }: CreateBankAccountInput) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    // TODO: Apply retry to handle race condition (2 separated users create account at the same time)
    const newAccountNumber = await this.generateUniqueAccountNumber();

    const newBankAccount = await this.bankAccountRepository.create({
      user,
      name,
      accountNumber: newAccountNumber,
    });

    return { data: newBankAccount };
  }

  async updateBankAccount({ name, userId, bankAccountId }: UpdateBankAccountInput) {
    const bankAccount = await this.bankAccountRepository.findBankAccountByUserIdAndBankId(
      userId,
      bankAccountId,
    );

    if (!bankAccount) {
      return { error: ERROR_CODES.ITEM_NOT_FOUND };
    }

    const updatedBankAccount = await this.bankAccountRepository.update(
      {
        name,
      },
      bankAccountId,
    );
    return { data: updatedBankAccount };
  }
}
