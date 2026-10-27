import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

const MODES = ['sandbox', 'live', 'unconfigured']
const VERIFICATIONS = ['verified', 'failed', 'unverified']
const UNAVAILABLE = 'Payment environment unavailable. Refresh to check again.'

function isAccountId(value) {
  return value === null || (typeof value === 'string' && /^acct_[a-zA-Z0-9]{1,128}$/.test(value))
}

export async function fetchAdminPaymentEnvironment({ signal } = {}) {
  const data = await parseJsonResponse(
    await fetchApi('/api/admin/payments/environment', {
      method: 'GET', cache: 'no-store', signal,
    }),
    UNAVAILABLE,
  )
  const value = data?.environment
  if (
    data?.success !== true || !value
    || !MODES.includes(value.mode) || !MODES.includes(value.keyMode)
    || !VERIFICATIONS.includes(value.verification)
    || typeof value.paymentsEnabled !== 'boolean'
    || typeof value.canCreatePayments !== 'boolean'
    || value.livePaymentsSupported !== false
    || !isAccountId(value.accountId) || !isAccountId(value.expectedAccountId)
    || (value.chargesEnabled !== null && typeof value.chargesEnabled !== 'boolean')
    || (value.checkedAt !== null && (
      typeof value.checkedAt !== 'string' || !Number.isFinite(Date.parse(value.checkedAt))
    ))
    || !Array.isArray(value.blockers)
    || !value.blockers.every(blocker => (
      typeof blocker?.code === 'string' && typeof blocker.message === 'string'
    ))
  ) throw new Error(UNAVAILABLE)

  // Keep this read model separate from credentials or future payment actions.
  return {
    mode: value.mode,
    keyMode: value.keyMode,
    paymentsEnabled: value.paymentsEnabled,
    canCreatePayments: value.canCreatePayments,
    livePaymentsSupported: value.livePaymentsSupported,
    verification: value.verification,
    accountId: value.accountId,
    expectedAccountId: value.expectedAccountId,
    chargesEnabled: value.chargesEnabled,
    checkedAt: value.checkedAt,
    blockers: value.blockers.map(({ code, message }) => ({ code, message })),
  }
}
