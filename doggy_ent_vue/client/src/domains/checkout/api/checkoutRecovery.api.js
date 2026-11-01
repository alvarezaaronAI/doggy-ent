import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
import { readCheckoutRecovery } from '../utils/checkoutRecovery.js'
import { rememberReceiptAccess } from '../utils/receiptAccess.js'

const statuses = ['PREPARED', 'OPEN', 'PROCESSING', 'PAID_PENDING_ORDER', 'COMPLETED', 'PAID_REVIEW', 'CANCELED', 'EXPIRED']
export const RECOVERY_ERROR = 'We could not check this payment. Do not pay again. Try checking its status or contact us.'

export function validateAttemptResult(result, id) {
  const attempt = result?.attempt
  if (!attempt || attempt.id !== id || !statuses.includes(attempt.status)
    || !Array.isArray(attempt.allowedActions) || attempt.allowedActions.some(action => !['confirm', 'finalize', 'cancel'].includes(action))
    || !Number.isSafeInteger(attempt.amountCents) || attempt.amountCents < 0 || attempt.currency !== 'usd') {
    throw new Error(RECOVERY_ERROR)
  }
  return result
}

async function request(record, action = '') {
  try {
    const response = await fetchApi(`/api/checkout/attempts/${encodeURIComponent(record.id)}${action ? '/' + action : ''}`, {
      method: action ? 'POST' : 'GET',
      cache: 'no-store',
      headers: { 'X-Checkout-Recovery': record.token },
    })
    const data = await parseJsonResponse(response, RECOVERY_ERROR)
    if (data?.success !== true) throw new Error(RECOVERY_ERROR)
    return validateAttemptResult(data.result, record.id)
  } catch { throw new Error(RECOVERY_ERROR) }
}

export const fetchCheckoutAttempt = record => request(record)
export const finalizeCheckoutAttempt = record => request(record, 'finalize')
export const cancelCheckoutAttempt = record => request(record, 'cancel')

export async function restoreCheckoutReceipt(reference) {
  try {
    const record = readCheckoutRecovery()
    if (!record?.token) return false
    const result = await fetchCheckoutAttempt(record)
    if (result.attempt.status !== 'COMPLETED' || result.orderReference !== reference || !result.receiptAccess) return false
    rememberReceiptAccess(reference, result.receiptAccess)
    return true
  } catch { return false }
}
