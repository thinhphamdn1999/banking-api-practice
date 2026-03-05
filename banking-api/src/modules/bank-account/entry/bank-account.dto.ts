import { z } from 'zod';

import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';

export const CreateBankAccountSchema = z.object({
  name: z.string().min(1, 'Bank account name is required'),
});

export const UpdateBankAccountSchema = z.object({
  name: z.string().min(1, 'Bank account name is required'),
});

export type CreateBankAccountInput = z.infer<typeof CreateBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof UpdateBankAccountSchema>;

export interface BankAccountDTO {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export const toBankAccountDTO = (bankAccount: BankAccount): BankAccountDTO => {
  return {
    id: bankAccount.id,
    name: bankAccount.name,
    accountNumber: bankAccount.accountNumber,
    balance: Number(bankAccount.balance),
    createdAt: bankAccount.createdAt,
    updatedAt: bankAccount.updatedAt,
  };
};
