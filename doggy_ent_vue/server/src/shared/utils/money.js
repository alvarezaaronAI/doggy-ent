export function normalizeCurrencyAmount(value) {
  return Number(
    Number(value || 0).toFixed(2),
  )
}
