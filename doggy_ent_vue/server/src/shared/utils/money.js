export function normalizeCurrencyAmount(value) {
  const amount = Number(value || 0)

  if (!Number.isFinite(amount)) {
    return 0
  }

  return Number(
    amount.toFixed(2),
  )
}
