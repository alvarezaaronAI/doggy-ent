

export function formatCurrency(
  value,
  {
    currency = 'USD',
    locale = 'en-US',
  } = {},
) {
  return new Intl.NumberFormat(
    locale,
    {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(Number(value || 0))
}