import { checkoutAttempts } from '../services/checkoutAttempt.service.js'
import { getCustomerUserFromRequest } from '../../auth/services/customerAuth.service.js'
import { apiError } from '../../../shared/utils/apiError.js'

export function recoveryFailure(res, error) {
  const failure = apiError(error, 'Your payment could not be checked. Try again; do not start another payment.')
  const allowed = new Set(['CHECKOUT_RECOVERY_UNAVAILABLE', 'CHECKOUT_ATTEMPT_NOT_FOUND', 'CHECKOUT_IDENTITY_REQUIRED', 'CHECKOUT_INPUT_CHANGED', 'CHECKOUT_BUSY', 'CHECKOUT_CREATE_EXPIRED', 'PAYMENT_BINDING_MISMATCH', 'PROMO_INVALID', 'CHECKOUT_AMOUNT_INVALID'])
  res.set('Cache-Control', 'no-store')
  return res.status(failure.statusCode).json({ success: false, message: failure.message, ...(allowed.has(error.code) ? { code: error.code } : {}) })
}
export async function prepareCheckoutAttempt(req, res) {
  try {
    res.set('Cache-Control', 'no-store')
    const customer = await getCustomerUserFromRequest(req)
    const payload = await checkoutAttempts.prepare(req.body, { userId: customer?.id || null })
    return res.json({ success: true, ...payload })
  } catch (error) { return recoveryFailure(res, error) }
}
export async function getCheckoutAttempt(req, res) {
  try {
    res.set('Cache-Control', 'no-store')
    const result = await checkoutAttempts.status(req.params.id, req.get('X-Checkout-Recovery'))
    return res.json({ success: true, result })
  } catch (error) { return recoveryFailure(res, error) }
}
export async function cancelCheckoutAttempt(req, res) {
  try {
    res.set('Cache-Control', 'no-store')
    const result = await checkoutAttempts.status(req.params.id, req.get('X-Checkout-Recovery'), { cancel: true })
    return res.json({ success: true, result })
  } catch (error) { return recoveryFailure(res, error) }
}
