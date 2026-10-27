import Stripe from 'stripe'
import { getPaymentConfig, LIVE_PAYMENTS_SUPPORTED, paymentUnavailable } from '../config/payment.config.js'

export function createPaymentEnvironmentService({ readConfig = getPaymentConfig, createClient = key => new Stripe(key, { timeout: 8000, maxNetworkRetries: 0 }), now = Date.now } = {}) {
  let client, clientKey, cached, pending

  function getClient(key) {
    if (key !== clientKey) {
      client = createClient(key)
      clientKey = key
    }
    return client
  }

  async function verify(config) {
    const identity = `${config.secretKey}:${config.mode}:${config.expectedAccountId}`
    if (cached?.identity === identity && cached.expiresAt > now()) return cached.result
    if (pending?.identity === identity) return pending.promise
    const promise = (async () => {
      let result
      try {
        const account = await getClient(config.secretKey).accounts.retrieve()
        const accountId = /^acct_[A-Za-z0-9]{1,128}$/.test(account?.id || '') ? account.id : null
        result = {
          verification: accountId === config.expectedAccountId ? 'verified' : 'failed',
          accountId,
          chargesEnabled: typeof account?.charges_enabled === 'boolean' ? account.charges_enabled : null,
          checkedAt: new Date(now()).toISOString(),
          issues: accountId === config.expectedAccountId ? [] : [{ code: 'ACCOUNT_MISMATCH', message: 'Stripe returned a different account than STRIPE_EXPECTED_ACCOUNT_ID.' }],
        }
      } catch {
        result = { verification: 'failed', accountId: null, chargesEnabled: null, checkedAt: new Date(now()).toISOString(),
          issues: [{ code: 'VERIFICATION_FAILED', message: 'Stripe account verification failed. Check the server credential and its account-read permission.' }] }
      }
      cached = { identity, result, expiresAt: now() + (result.verification === 'verified' ? 30000 : 5000) }
      return result
    })()
    pending = { identity, promise }
    try { return await promise } finally { if (pending?.promise === promise) pending = null }
  }

  async function getEnvironment() {
    const config = readConfig()
    const result = config.issues.length ? { verification: 'unverified', accountId: null, chargesEnabled: null, checkedAt: null, issues: [] } : await verify(config)
    const blockers = [...config.issues, ...result.issues]
    if (!config.enabled) blockers.push({ code: 'PAYMENTS_PAUSED', message: 'New payments are paused. Existing payment verification is not disabled.' })
    if (config.mode === 'live' && !LIVE_PAYMENTS_SUPPORTED) blockers.push({ code: 'LIVE_NOT_READY', message: 'Live charging is locked until durable checkout and signed webhook recovery pass acceptance.' })
    if (result.verification === 'verified' && result.chargesEnabled !== true) blockers.push({ code: 'CHARGES_NOT_ENABLED', message: 'Stripe has not confirmed that this account can accept charges.' })
    return {
      mode: config.mode, keyMode: config.keyMode, paymentsEnabled: config.enabled,
      canCreatePayments: blockers.length === 0 && result.verification === 'verified',
      livePaymentsSupported: LIVE_PAYMENTS_SUPPORTED, verification: result.verification,
      accountId: result.accountId, expectedAccountId: config.expectedAccountId,
      chargesEnabled: result.chargesEnabled, checkedAt: result.checkedAt, blockers,
    }
  }

  async function getVerifiedContext({ forCreation = false } = {}) {
    const config = readConfig()
    if (config.issues.length) throw paymentUnavailable()
    if (forCreation && (!config.enabled || config.mode === 'live' && !LIVE_PAYMENTS_SUPPORTED)) throw paymentUnavailable()
    const result = await verify(config)
    if (result.verification !== 'verified' || forCreation && result.chargesEnabled !== true) throw paymentUnavailable()
    return { stripe: getClient(config.secretKey), mode: config.mode, accountId: result.accountId }
  }

  async function getPublicConfiguration() {
    const config = readConfig()
    // A paused or incomplete deployment must not probe Stripe on every public read.
    if (config.issues.length || !config.enabled || config.mode === 'live' && !LIVE_PAYMENTS_SUPPORTED) {
      return { mode: config.mode, enabled: false, message: paymentUnavailable().message }
    }
    const environment = await getEnvironment()
    return { mode: environment.mode, enabled: environment.canCreatePayments,
      message: environment.canCreatePayments ? 'Secure payment is available.' : paymentUnavailable().message }
  }

  return { getEnvironment, getVerifiedContext, getPublicConfiguration }
}

const environmentService = createPaymentEnvironmentService()
export const getPaymentEnvironment = environmentService.getEnvironment
export const getVerifiedStripeContext = environmentService.getVerifiedContext
export const getPublicPaymentConfiguration = environmentService.getPublicConfiguration
