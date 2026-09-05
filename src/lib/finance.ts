export function toSignedNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatSignedAmount(value: number | string | null | undefined) {
  const numeric = toSignedNumber(value);
  if (numeric === 0) {
    return 'Rs. 0.00';
  }
  const prefix = numeric > 0 ? '+' : '-';
  return `${prefix}Rs. ${Math.abs(numeric).toFixed(2)}`;
}
