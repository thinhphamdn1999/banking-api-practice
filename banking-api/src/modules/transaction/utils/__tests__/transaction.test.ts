import { TransactionType } from '@/modules/transaction/types/transaction';
import { resolveTransactionName } from '../transaction';

describe('resolveTransactionName', () => {
  describe('DEPOSIT', () => {
    it('should return deposit name with destination account', () => {
      expect(resolveTransactionName(TransactionType.DEPOSIT, null, 'Savings')).toBe(
        'Deposit to Savings',
      );
    });

    it('should return deposit name when toAccountName is undefined', () => {
      expect(resolveTransactionName(TransactionType.DEPOSIT)).toBe('Deposit to undefined');
    });
  });

  describe('WITHDRAW', () => {
    it('should return withdraw name with source account', () => {
      expect(resolveTransactionName(TransactionType.WITHDRAW, 'Checking', null)).toBe(
        'Withdraw from Checking',
      );
    });

    it('should return withdraw name when fromAccountName is undefined', () => {
      expect(resolveTransactionName(TransactionType.WITHDRAW)).toBe('Withdraw from undefined');
    });
  });

  describe('TRANSFER', () => {
    it('should return transfer name with destination account', () => {
      expect(resolveTransactionName(TransactionType.TRANSFER, 'Checking', 'Savings')).toBe(
        'Transfer to Savings',
      );
    });

    it('should return transfer name when toAccountName is undefined', () => {
      expect(resolveTransactionName(TransactionType.TRANSFER, 'Checking')).toBe(
        'Transfer to undefined',
      );
    });
  });

  it('should return empty string for unknown type', () => {
    expect(resolveTransactionName('unknown' as TransactionType)).toBe('');
  });
});
