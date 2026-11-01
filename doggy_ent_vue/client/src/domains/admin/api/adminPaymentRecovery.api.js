import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

export async function fetchPaymentRecoveryCases() {
  const data = await parseJsonResponse(await fetchApi('/api/admin/payments/recovery', { method: 'GET', cache: 'no-store' }), 'Payment review cases could not be loaded.')
  if (data.success !== true || typeof data.enabled !== 'boolean' || !Array.isArray(data.cases) || data.cases.length > 50
    || data.cases.some(row => typeof row?.id !== 'string' || !row.id || row.id.length > 100
      || !['PREPARED', 'OPEN', 'PROCESSING', 'PAID_PENDING_ORDER', 'PAID_REVIEW', 'EXPIRED'].includes(row.status)
      || !['sandbox', 'live'].includes(row.paymentMode) || row.currency !== 'usd'
      || !Number.isSafeInteger(row.amountCents) || row.amountCents < 1
      || row.paymentIntentId != null && !/^pi_[A-Za-z0-9]{1,200}$/.test(row.paymentIntentId)
      || row.lastErrorCode != null && !/^[A-Z0-9_]{1,100}$/.test(row.lastErrorCode))) throw new Error('Payment review cases could not be loaded.')
  return { enabled: data.enabled, cases: data.cases.map(row => ({
    id: row.id, status: row.status, amountCents: row.amountCents, currency: row.currency,
    paymentMode: row.paymentMode, paymentIntentId: row.paymentIntentId, lastErrorCode: row.lastErrorCode,
    retryCount: row.retryCount, createdAt: row.createdAt,
  })) }
}
