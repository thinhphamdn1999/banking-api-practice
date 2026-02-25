import { colors } from '@/theme/colors';
import type { Transaction } from '@/types/transaction';

/**
 * Returns a display string (+$x.xx / -$x.xx / $x.xx) and its color
 * based on transaction type.
 */
export const formatTransactionAmount = (tx: Transaction): { text: string; color: string } => {
  const amount = tx.amount.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (tx.type === 'deposit') return { text: `+$${amount}`, color: colors.green70 };
  if (tx.type === 'withdraw') return { text: `-$${amount}`, color: colors.red70 };
  return { text: `$${amount}`, color: colors.neutral60 };
};
