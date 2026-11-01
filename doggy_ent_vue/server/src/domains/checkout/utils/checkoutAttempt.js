import { createHash, timingSafeEqual } from 'node:crypto'

export const RECOVERY_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const QUOTE_TTL_MS = 30 * 60 * 1000
export const CREATE_RETRY_TTL_MS = 12 * 60 * 60 * 1000
export const TERMINAL_ATTEMPT_STATES = ['COMPLETED', 'CANCELED', 'PAID_REVIEW']
export const isAttemptId = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)
export const isRecoveryToken = value => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value)
export const recoveryEnabled = (env = process.env) => env.CHECKOUT_RECOVERY_ENABLED === 'true'
export const digest = value => createHash('sha256').update(value).digest('hex')
export function proofMatches(token, hash) {
  return isRecoveryToken(token) && /^[a-f0-9]{64}$/.test(hash || '')
    && timingSafeEqual(Buffer.from(digest(token)), Buffer.from(hash))
}
export const attemptError = (code, message, statusCode = 409) => Object.assign(new Error(message), { code, statusCode })

const text = (value, max = 300) => typeof value === 'string' ? value.trim().slice(0, max) : ''
export function normalizeAttemptInput(input = {}) {
  const customer = {}
  for (const key of ['firstName', 'lastName', 'email', 'phone', 'address1', 'address2', 'city', 'state', 'zip', 'country', 'deliveryNotes']) {
    customer[key] = text(input.customer?.[key], key === 'deliveryNotes' ? 1000 : 300)
  }
  customer.email = customer.email.toLowerCase()
  customer.marketingOptIn = input.customer?.marketingOptIn === true
  customer.saveInfo = input.customer?.saveInfo === true
  return {
    customer,
    cartItems: (Array.isArray(input.cartItems) ? input.cartItems : []).map(item => ({
      id: text(item?.productId || item?.id), size: text(item?.size, 50), quantity: Number(item?.quantity),
    })).sort((a, b) => `${a.id}:${a.size}`.localeCompare(`${b.id}:${b.size}`)),
    shipping: { method: text(input.shipping?.method, 100), rateId: text(input.shipping?.rateId, 200) },
    promoCode: text(input.promoCode, 100).toUpperCase() || null,
    paymentMode: text(input.paymentMode, 20),
  }
}

export function assertAttemptPayment(attempt, intent, context) {
  const taxId = attempt.snapshot.preview.taxSnapshot?.calculationId || null
  if (context.accountId !== attempt.stripeAccountId || context.mode !== attempt.paymentMode
    || intent?.livemode !== (attempt.paymentMode === 'live')
    || intent?.metadata?.checkoutAttemptId !== attempt.id
    || intent?.metadata?.checkoutInputHash !== attempt.inputHash
    || intent?.amount !== attempt.amountCents || intent?.currency !== attempt.currency
    || intent?.status === 'succeeded' && intent?.amount_received !== attempt.amountCents
    || (intent?.hooks?.inputs?.tax?.calculation || null) !== taxId
    || attempt.paymentIntentId && intent?.id !== attempt.paymentIntentId) {
    throw attemptError('PAYMENT_BINDING_MISMATCH', 'Your payment needs a secure review. Do not pay again; contact support.')
  }
}
