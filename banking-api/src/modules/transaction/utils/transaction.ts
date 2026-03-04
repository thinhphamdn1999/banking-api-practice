import { TransactionType } from '@/modules/transaction/types/transaction';

export function resolveTransactionName(
  type: TransactionType,
  fromAccountName?: string | null,
  toAccountName?: string | null,
): string {
  switch (type) {
    case TransactionType.DEPOSIT:
      return `Deposit to ${toAccountName}`;
    case TransactionType.WITHDRAW:
      return `Withdraw from ${fromAccountName}`;
    case TransactionType.TRANSFER:
      return `Transfer to ${toAccountName}`;
    default:
      return '';
  }
}
