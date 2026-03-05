import { formatMoney } from '../money';

describe('formatMoney', () => {
  it('should return rounded amount and upper case currency', () => {
    expect(formatMoney('100.00', 'usd')).toEqual({ amount: 100, currency: 'USD' });
  });

  it('should round decimal amounts', () => {
    expect(formatMoney('99.6', 'usd')).toEqual({ amount: 100, currency: 'USD' });
    expect(formatMoney('99.4', 'usd')).toEqual({ amount: 99, currency: 'USD' });
  });

  it('should uppercase currency', () => {
    expect(formatMoney('50.00', 'eur')).toEqual({ amount: 50, currency: 'EUR' });
    expect(formatMoney('50.00', 'Gbp')).toEqual({ amount: 50, currency: 'GBP' });
  });

  it('should handle integer string values', () => {
    expect(formatMoney('200', 'usd')).toEqual({ amount: 200, currency: 'USD' });
  });

  it('should handle zero', () => {
    expect(formatMoney('0', 'usd')).toEqual({ amount: 0, currency: 'USD' });
    expect(formatMoney('0.00', 'usd')).toEqual({ amount: 0, currency: 'USD' });
  });
});
