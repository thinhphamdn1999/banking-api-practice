import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';

export const transactionMapper = (transaction: Transaction) => {
  return {
    id: transaction.id,
    name: transaction.name,
    description: transaction.description,
    type: transaction.type,
    status: transaction.status,
    amount: formattedMoney(transaction.amount, transaction.currency),
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    fromAccount: transaction.fromAccount,
    toAccount: transaction.toAccount,
  };
};

function formattedMoney(value: string, currency: string) {
  const numeric = Number(value);

  return {
    amount: Math.round(numeric),
    currency: currency.toUpperCase(),
  };
}
