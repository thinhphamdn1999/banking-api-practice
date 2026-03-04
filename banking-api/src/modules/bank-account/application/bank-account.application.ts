import { PaginationOptions } from '@/common/types/pagination';
import {
  CreateBankAccountInput,
  FilterOptions,
  UpdateBankAccountInput,
} from '@/modules/bank-account/types/bank-account';

import { UserService } from '@/modules/user/domain/services/user.service';
import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';

export class BankAccountApplicationService {
  constructor(
    private readonly bankAccountService: BankAccountService,
    private readonly userService: UserService,
  ) {}

  private async generateUniqueAccountNumber(): Promise<string> {
    while (true) {
      const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const exists = await this.bankAccountService.findByAccountNumber(number);
      if (!exists) return number;
    }
  }

  async findBankAccounts(pagination: PaginationOptions, filter?: FilterOptions) {
    return await this.bankAccountService.findBankAccounts(pagination, filter);
  }

  async getBankAccountById(bankAccountId: string, userId?: string) {
    return await this.bankAccountService.getBankAccountById(bankAccountId, userId);
  }

  async createBankAccount(input: CreateBankAccountInput) {
    const user = await this.userService.getUserById(input.userId);

    const newAccountNumber = await this.generateUniqueAccountNumber();

    return await this.bankAccountService.createBankAccount({
      user,
      name: input.name,
      accountNumber: newAccountNumber,
    });
  }

  async updateBankAccount({ name, userId, bankAccountId }: UpdateBankAccountInput) {
    await this.userService.getUserById(userId);

    await this.bankAccountService.getBankAccountById(bankAccountId, userId);

    return await this.bankAccountService.updateBankAccount({ name, userId, bankAccountId });
  }
}
