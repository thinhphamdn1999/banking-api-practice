import { PaginatedResponse, PaginationOptions } from '@/common/types/pagination';
import { FilterOptions, UpdateBankAccountInput } from '@/modules/bank-account/types/bank-account';
import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';

export interface CreateBankAccountInput {
  name: string;
  userId: string;
}

export interface BankAccountApplicationService {
  findBankAccounts(
    pagination: PaginationOptions,
    filter?: FilterOptions,
  ): Promise<PaginatedResponse<BankAccount>>;
  getBankAccountById(bankAccountId: string, userId?: string): Promise<BankAccount>;
  createBankAccount(input: CreateBankAccountInput): Promise<BankAccount>;
  updateBankAccount(input: UpdateBankAccountInput): Promise<BankAccount | null>;
}
