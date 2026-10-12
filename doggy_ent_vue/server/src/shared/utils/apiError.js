export function apiError(error, fallbackMessage) {
  const status = Number(error?.statusCode)
  const providerError = String(error?.type || error?.name || '').startsWith('Stripe')
    || String(error?.name || '').startsWith('Prisma')
  const statusCode = !providerError && Number.isInteger(status) && status >= 400 && status < 500 ? status : 500
  return { statusCode, message: statusCode === 500 ? fallbackMessage : error.message || fallbackMessage }
}
