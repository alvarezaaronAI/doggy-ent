import { getVerifiedStripeContext } from '../../payments/services/paymentEnvironment.service.js'
import { assertPaymentRequestMode } from '../../payments/config/payment.config.js'
import { normalizePromoDiscountValue } from '../../promos/services/promos.service.js'
import { validateRequiredCheckoutFields } from '../validators/checkout.validator.js'
import { resolveCheckoutItems } from './checkoutCatalog.service.js'
import { previewCheckout } from './checkout.service.js'
import { finalizeCheckoutAttempt } from '../repositories/checkoutFinalization.repository.js'
import * as repository from '../repositories/checkoutAttempt.repository.js'
import { signCapability } from '../../../shared/utils/signedCapability.js'
import { findOrderById } from '../../orders/repositories/orders.repository.js'
import {
  assertAttemptPayment, attemptError, CREATE_RETRY_TTL_MS, digest, isAttemptId,
  isRecoveryToken, normalizeAttemptInput, proofMatches, QUOTE_TTL_MS,
  RECOVERY_TTL_MS, recoveryEnabled,
} from '../utils/checkoutAttempt.js'

const unavailable = () => attemptError('CHECKOUT_RECOVERY_UNAVAILABLE', 'Payment recovery is temporarily unavailable. Please try again; do not start another payment.', 503)
const hidden = () => attemptError('CHECKOUT_ATTEMPT_NOT_FOUND', 'This checkout could not be opened. Use the browser where you started it or contact support.', 404)

export function createCheckoutAttemptService({ repo = repository, context = getVerifiedStripeContext,
  resolveItems = resolveCheckoutItems, preview = previewCheckout, finalize = finalizeCheckoutAttempt,
  findOrder = findOrderById, now = Date.now, enabled = recoveryEnabled } = {}) {
  function assertEnabled() { if (!enabled()) throw unavailable() }
  async function saveClaim(id, lease, data) {
    if ((await repo.updateClaimedAttempt(id, lease, data)).count !== 1) {
      throw attemptError('CHECKOUT_BUSY', 'Your payment is being checked. Please try again in a moment.')
    }
  }
  async function authorized(id, token) {
    assertEnabled()
    if (!isAttemptId(id) || !isRecoveryToken(token)) throw hidden()
    const attempt = await repo.findAttempt(id)
    if (!attempt || !proofMatches(token, attempt.recoveryHash) || new Date(attempt.recoveryExpiresAt).getTime() <= now()) throw hidden()
    return attempt
  }
  async function projection(attempt) {
    const { snapshot, status } = attempt
    const validQuote = new Date(attempt.expiresAt).getTime() > now()
    const allowedActions = status === 'COMPLETED' || status === 'PAID_REVIEW' || status === 'CANCELED' ? []
      : status === 'PAID_PENDING_ORDER' ? ['finalize']
        : ['PREPARED', 'OPEN', 'EXPIRED'].includes(status) ? [...(validQuote ? ['confirm'] : []), 'cancel'] : []
    const result = { attempt: {
      id: attempt.id, status, expiresAt: attempt.expiresAt, recoveryExpiresAt: attempt.recoveryExpiresAt,
      amountCents: attempt.amountCents, currency: attempt.currency,
      pricing: snapshot.preview.pricing, items: snapshot.items.map(item => ({
        id: item.productId, name: item.name, image: item.image, size: item.size, sku: item.sku,
        price: item.price, quantity: item.quantity,
      })),
      customer: snapshot.customer, shipping: snapshot.preview.shipping, allowedActions,
      promo: snapshot.preview.promo?.valid ? {
        valid: true, code: snapshot.preview.promo.code, discountType: snapshot.preview.promo.discountType,
        discountValue: snapshot.preview.promo.discountValue, discountAmount: snapshot.preview.promo.discountAmount,
      } : null,
      campaigns: (snapshot.preview.campaigns || []).map(campaign => ({
        campaignId: campaign.campaignId, campaignName: campaign.campaignName,
        donationTarget: campaign.donationTarget, donationType: campaign.donationType,
        donationValue: campaign.donationValue, donationAmount: campaign.donationAmount,
        matchedSubtotal: campaign.matchedSubtotal, matchedProductIds: campaign.matchedProductIds,
      })),
    } }
    if (status === 'COMPLETED' && attempt.orderId) {
      const order = await findOrder(attempt.orderId)
      if (order) {
        result.orderReference = order.orderNumber
        result.receiptAccess = signCapability('order-receipt', { reference: order.orderNumber }, 24 * 60 * 60 * 1000)
      }
    }
    return result
  }
  async function createIntent(attempt) {
    if (now() - new Date(attempt.createdAt).getTime() >= CREATE_RETRY_TTL_MS) {
      throw attemptError('CHECKOUT_CREATE_EXPIRED', 'This payment needs review before another can be started. Contact support; do not pay again.')
    }
    const ctx = await context({ forCreation: true })
    if (ctx.accountId !== attempt.stripeAccountId || ctx.mode !== attempt.paymentMode) throw unavailable()
    const taxId = attempt.snapshot.preview.taxSnapshot?.calculationId
    const intent = await ctx.stripe.paymentIntents.create({
      amount: attempt.amountCents, currency: attempt.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { checkoutAttemptId: attempt.id, checkoutInputHash: attempt.inputHash },
      ...(taxId ? { hooks: { inputs: { tax: { calculation: taxId } } } } : {}),
    }, { idempotencyKey: `checkout-attempt-${attempt.id}-v1` })
    assertAttemptPayment(attempt, intent, ctx)
    return { intent, ctx }
  }
  async function prepare(input, { userId = null } = {}) {
    assertEnabled()
    const { attemptId, recoveryToken } = input || {}
    if (!isAttemptId(attemptId) || !isRecoveryToken(recoveryToken)) throw attemptError('CHECKOUT_IDENTITY_REQUIRED', 'Reload checkout before paying.', 400)
    const normalized = normalizeAttemptInput(input)
    const inputHash = digest(JSON.stringify(normalized))
    let attempt = await repo.findAttempt(attemptId)
    if (!attempt) {
      validateRequiredCheckoutFields(normalized)
      assertPaymentRequestMode(normalized.paymentMode)
      const ctx = await context({ forCreation: true })
      const items = await resolveItems(normalized.cartItems)
      const quote = await preview(normalized, { trustedItems: items, includeTaxSnapshot: true })
      if (normalized.promoCode && quote.promo?.valid !== true) throw attemptError('PROMO_INVALID', quote.promo?.message || 'This promo is unavailable.', 400)
      let promoAgreement = null
      if (quote.promo?.valid) {
        const promo = await repo.findPromoAgreement(quote.promo.code)
        if (!promo || promo.discountType !== quote.promo.discountType || normalizePromoDiscountValue(promo) !== Number(quote.promo.discountValue)) {
          throw attemptError('PROMO_INVALID', 'This promo changed. Apply it again before paying.', 400)
        }
        promoAgreement = { promoId: promo.id, code: promo.code, name: promo.name,
          usageLimitTotal: promo.usageLimitTotal ?? null,
          usageLimitPerCustomer: promo.usageLimitPerCustomer ?? null }
      }
      const amountCents = Math.round(quote.pricing.total * 100)
      if (!Number.isSafeInteger(amountCents) || amountCents < 1) throw attemptError('CHECKOUT_AMOUNT_INVALID', 'Review your order total before paying.', 400)
      const timestamp = now()
      attempt = await repo.insertAttempt({
        id: attemptId, recoveryHash: digest(recoveryToken), inputHash,
        snapshot: JSON.parse(JSON.stringify({ version: 1, items, customer: normalized.customer, preview: quote, promoAgreement, userId })),
        userId, amountCents, currency: 'usd', paymentMode: ctx.mode, stripeAccountId: ctx.accountId,
        expiresAt: new Date(timestamp + QUOTE_TTL_MS), recoveryExpiresAt: new Date(timestamp + RECOVERY_TTL_MS),
      })
    }
    attempt = await authorized(attemptId, recoveryToken)
    if (attempt.inputHash !== inputHash) throw attemptError('CHECKOUT_INPUT_CHANGED', 'Your checkout changed. Check or cancel the previous payment before paying again.')
    if (new Date(attempt.expiresAt).getTime() <= now()) {
      const result = await reconcile(attemptId)
      return { result: await projection(result) }
    }
    if (['COMPLETED', 'PAID_REVIEW', 'CANCELED'].includes(attempt.status)) return { result: await projection(attempt) }
    const lease = await repo.claimAttempt(attemptId, new Date(now()))
    if (!lease) throw attemptError('CHECKOUT_BUSY', 'Your payment is being checked. Please try again in a moment.')
    try {
      attempt = await repo.findAttempt(attemptId)
      let intent, ctx
      if (attempt.paymentIntentId) {
        ctx = await context()
        intent = await ctx.stripe.paymentIntents.retrieve(attempt.paymentIntentId)
      } else ({ intent, ctx } = await createIntent(attempt))
      assertAttemptPayment(attempt, intent, ctx)
      await saveClaim(attemptId, lease, { paymentIntentId: intent.id })
      if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(intent.status)) {
        await context({ forCreation: true })
        await saveClaim(attemptId, lease, { status: 'OPEN', nextRetryAt: new Date(now() + 60000) })
        const current = await repo.findAttempt(attemptId)
        return { clientSecret: intent.client_secret, paymentIntentId: intent.id, pricing: current.snapshot.preview.pricing, result: await projection(current) }
      }
    } finally { await repo.releaseAttempt(attemptId, lease) }
    return { result: await projection(await reconcile(attemptId)) }
  }
  async function reconcile(id, { cancel = false, eventPaymentIntentId = null } = {}) {
    const lease = await repo.claimAttempt(id, new Date(now()))
    if (!lease) return repo.findAttempt(id)
    let attempt
    try {
      attempt = await repo.findAttempt(id)
      if (!attempt || ['COMPLETED', 'CANCELED', 'PAID_REVIEW'].includes(attempt.status)) return attempt
      if (!attempt.paymentIntentId && !eventPaymentIntentId && !cancel) return attempt
      const ctx = await context()
      if (ctx.accountId !== attempt.stripeAccountId || ctx.mode !== attempt.paymentMode) throw unavailable()
      // Replaying the same creation is the only safe way to resolve a lost create response.
      const paymentId = eventPaymentIntentId || attempt.paymentIntentId
      let intent = paymentId ? await ctx.stripe.paymentIntents.retrieve(paymentId) : (await createIntent(attempt)).intent
      assertAttemptPayment(attempt, intent, ctx)
      await saveClaim(id, lease, { paymentIntentId: intent.id })
      if ((cancel || new Date(attempt.expiresAt).getTime() <= now()) && ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(intent.status)) {
        try { intent = await ctx.stripe.paymentIntents.cancel(intent.id, {}, { idempotencyKey: `checkout-cancel-${id}-v1` }) }
        catch { intent = await ctx.stripe.paymentIntents.retrieve(intent.id) }
        assertAttemptPayment({ ...attempt, paymentIntentId: intent.id }, intent, ctx)
      }
      if (intent.status === 'succeeded') {
        await saveClaim(id, lease, { status: 'PAID_PENDING_ORDER', paidAt: attempt.paidAt || new Date(now()) })
        await finalize(id, { paymentIntentId: intent.id, leaseToken: lease })
      } else {
        const status = intent.status === 'canceled' ? 'CANCELED'
          : ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(intent.status) ? 'OPEN' : 'PROCESSING'
        await saveClaim(id, lease, { status, lastErrorCode: null, nextRetryAt: new Date(now() + (status === 'OPEN' ? 60000 : 15000)) })
      }
      await repo.finishEvents(id)
    } catch (error) {
      if (attempt) {
        const review = error.code === 'PAYMENT_BINDING_MISMATCH' || error.code === 'CHECKOUT_CREATE_EXPIRED' || error.statusCode === 409 && error.code !== 'CHECKOUT_BUSY'
        await repo.updateClaimedAttempt(id, lease, {
          ...(review ? { status: 'PAID_REVIEW' } : {}), retryCount: { increment: 1 },
          lastErrorCode: review ? (error.code || 'FULFILLMENT_REVIEW_REQUIRED') : 'PAYMENT_RECOVERY_RETRY',
          nextRetryAt: new Date(now() + Math.min(300000, 15000 * 2 ** Math.min(attempt.retryCount, 4))),
        })
        if (review) await repo.finishEvents(id)
      }
      if (!error.statusCode) throw unavailable()
      throw error
    } finally { await repo.releaseAttempt(id, lease) }
    return repo.findAttempt(id)
  }
  async function status(id, token, options = {}) {
    await authorized(id, token)
    await reconcile(id, options)
    return projection(await authorized(id, token))
  }
  return { prepare, status, reconcile, projection, authorized }
}

export const checkoutAttempts = createCheckoutAttemptService()
