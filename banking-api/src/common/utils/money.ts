export function formatMoney(value: string, currency: string) {
  return {
    amount: Math.round(Number(value)),
    currency: currency.toUpperCase(),
  };
}
