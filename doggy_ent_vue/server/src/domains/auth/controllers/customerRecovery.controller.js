import { getCustomerRecoveryReadiness } from '../services/customerRecovery.service.js'

export function getCustomerRecoveryReadinessController(_req, res) {
  res.set('Cache-Control', 'no-store')
  return res.json(getCustomerRecoveryReadiness())
}

export function requireCustomerResetDelivery(_req, res, next) {
  res.set('Cache-Control', 'no-store')
  if (!getCustomerRecoveryReadiness().passwordResetAvailable) {
    return res.status(503).json({ message: 'Password reset email is not available right now. Please contact us for help.' })
  }
  return next()
}
