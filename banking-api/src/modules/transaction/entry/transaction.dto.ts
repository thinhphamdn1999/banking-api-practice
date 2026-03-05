import { z } from 'zod';

import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';

import { TransactionStatus, TransactionType } from '@/modules/transaction/types/transaction';

import { BankAccountDTO, toBankAccountDTO } from '@/modules/bank-account/entry/bank-account.dto';

import { formatMoney } from '@/common/utils/money';

const baseTransactionFields = {
  amount: z.object({
    amount: z.number().positive('Amount must be larger than 0'),
    currency: z.string().min(1, 'Currency is required'),
  }),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
  description: z.string().optional(),
};

export const CreateTransactionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(TransactionType.DEPOSIT),
    ...baseTransactionFields,
    destinationAccountId: z.string().min(1, 'destinationAccountId is required for deposit'),
  }),
  z.object({
    type: z.literal(TransactionType.WITHDRAW),
    ...baseTransactionFields,
    sourceAccountId: z.string().min(1, 'sourceAccountId is required for withdraw'),
  }),
  z.object({
    type: z.literal(TransactionType.TRANSFER),
    ...baseTransactionFields,
    sourceAccountId: z.string().min(1, 'sourceAccountId is required for transfer'),
    destinationAccountId: z.string().min(1, 'destinationAccountId is required for transfer'),
  }),
]);

export const UpdateTransactionSchema = z.object({
  description: z.string().optional(),
});

export type CreateTransactionBody = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionBody = z.infer<typeof UpdateTransactionSchema>;

export interface TransactionDTO {
  id: string;
  name: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
  fromAccountBalance: number | null;
  toAccountBalance: number | null;
  fromAccount: BankAccountDTO | null;
  toAccount: BankAccountDTO | null;
}

export const toTransactionDTO = (transaction: Transaction): TransactionDTO => {
  return {
    id: transaction.id,
    name: transaction.name,
    description: transaction.description,
    type: transaction.type,
    status: transaction.status,
    amount: formatMoney(transaction.amount, transaction.currency),
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    fromAccountBalance: transaction.fromAccountBalance
      ? Number(transaction.fromAccountBalance)
      : null,
    toAccountBalance: transaction.toAccountBalance ? Number(transaction.toAccountBalance) : null,
    fromAccount: transaction.fromAccount ? toBankAccountDTO(transaction.fromAccount) : null,
    toAccount: transaction.toAccount ? toBankAccountDTO(transaction.toAccount) : null,
  };
};
