// Remove this lock only with accepted durable checkout and signed-event recovery.
export const LIVE_PAYMENTS_SUPPORTED = false

export function getPaymentConfig(env = process.env) {
  const mode = ['sandbox', 'live'].includes(env.PAYMENT_MODE) ? env.PAYMENT_MODE : 'unconfigured'
  const secretKey = typeof env.STRIPE_SECRET_KEY === 'string' ? env.STRIPE_SECRET_KEY : ''
  const match = /^(?:sk|rk)_(test|live)_[A-Za-z0-9]+$/.exec(secretKey)
  const keyMode = match ? match[1] === 'test' ? 'sandbox' : 'live' : 'unconfigured'
  const expectedAccountId = /^acct_[A-Za-z0-9]{1,128}$/.test(env.STRIPE_EXPECTED_ACCOUNT_ID || '')
    ? env.STRIPE_EXPECTED_ACCOUNT_ID : null
  const issues = []
  if (mode === 'unconfigured') issues.push({ code: 'MODE_UNCONFIGURED', message: 'Set PAYMENT_MODE to sandbox or live on the server.' })
  if (env.PAYMENTS_ENABLED !== undefined && !['true', 'false'].includes(env.PAYMENTS_ENABLED)) issues.push({ code: 'INVALID_ENABLE_FLAG', message: 'PAYMENTS_ENABLED must be exactly true or false.' })
  if (keyMode === 'unconfigured') issues.push({ code: 'KEY_UNCONFIGURED', message: 'A valid server-only Stripe credential is required.' })
  if (mode !== 'unconfigured' && keyMode !== 'unconfigured' && mode !== keyMode) issues.push({ code: 'KEY_MODE_MISMATCH', message: 'The Stripe credential does not match PAYMENT_MODE.' })
  if (!expectedAccountId) issues.push({ code: 'ACCOUNT_UNCONFIGURED', message: 'Set STRIPE_EXPECTED_ACCOUNT_ID to the intended Stripe account.' })
  return { mode, keyMode, expectedAccountId, secretKey, enabled: env.PAYMENTS_ENABLED === 'true', issues }
}

export function paymentUnavailable() {
  return Object.assign(new Error('Secure checkout is temporarily unavailable. Please try again later.'), {
    code: 'PAYMENT_ENVIRONMENT_UNAVAILABLE', statusCode: 503,
  })
}

export function assertPaymentRequestMode(paymentMode, config = getPaymentConfig()) {
  if (config.issues.length || !config.enabled || config.mode === 'live' && !LIVE_PAYMENTS_SUPPORTED) throw paymentUnavailable()
  if (!['sandbox', 'live'].includes(paymentMode) || paymentMode !== config.mode) {
    throw Object.assign(new Error('Payment settings changed. Reload checkout before paying.'), {
      code: 'PAYMENT_ENVIRONMENT_MISMATCH', statusCode: 409,
    })
  }
}
