import Stripe from 'stripe'
import { getPaymentConfig } from '../config/payment.config.js'
import { recoveryEnabled, isAttemptId } from '../../checkout/utils/checkoutAttempt.js'
import { findAttempt, saveVerifiedEvent } from '../../checkout/repositories/checkoutAttempt.repository.js'
import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'

export const RECOVERY_EVENTS = new Set(['payment_intent.succeeded', 'payment_intent.processing', 'payment_intent.payment_failed', 'payment_intent.canceled'])

export function createStripeWebhookHandler({ verify = (body, signature, secret) => Stripe.webhooks.constructEvent(body, signature, secret),
  readConfig = getPaymentConfig, enabled = recoveryEnabled, readSecret = () => process.env.STRIPE_WEBHOOK_SECRET,
  find = findAttempt, save = saveVerifiedEvent } = {}) {
  return async (req, res) => {
    res.set('Cache-Control', 'no-store')
    const config = readConfig()
    const secret = readSecret()
    if (!enabled() || !secret || config.issues.length) return res.status(503).json({ success: false, message: 'Payment notifications are unavailable.' })
    let event
    try { event = verify(req.body, req.get('Stripe-Signature'), secret) }
    catch { return res.status(400).json({ success: false, message: 'Payment notification could not be verified.' }) }
    if (!event || event.livemode !== (config.mode === 'live') || event.account && event.account !== config.expectedAccountId) {
      return res.status(400).json({ success: false, message: 'Payment notification could not be verified.' })
    }
    if (!RECOVERY_EVENTS.has(event.type)) return res.json({ received: true })
    const intent = event.data?.object
    if (!/^evt_[A-Za-z0-9]{1,200}$/.test(event.id || '') || !/^pi_[A-Za-z0-9]{1,200}$/.test(intent?.id || '')) return res.status(400).json({ success: false, message: 'Invalid payment notification.' })
    try {
      const id = intent.metadata?.checkoutAttemptId
      const attempt = isAttemptId(id) ? await find(id) : null
      const accepted = attempt && attempt.paymentMode === config.mode && attempt.stripeAccountId === config.expectedAccountId
        && (!attempt.paymentIntentId || attempt.paymentIntentId === intent.id)
        && intent.metadata?.checkoutInputHash === attempt.inputHash
      // Store only routing identifiers. Canonical retrieval/finalization is asynchronous.
      await save({ id: event.id, type: event.type, paymentIntentId: intent.id,
        stripeAccountId: config.expectedAccountId, paymentMode: config.mode,
        attemptId: accepted ? attempt.id : null, status: accepted ? 'PENDING' : 'IGNORED',
        ...(!accepted ? { processedAt: new Date() } : {}),
      })
      return res.json({ received: true })
    } catch (error) {
      logOperationalFailure('PAYMENT_EVENT_SAVE_FAILED', error)
      return res.status(503).json({ success: false, message: 'Payment notification will be retried.' })
    }
  }
}

export const stripeWebhook = createStripeWebhookHandler()
