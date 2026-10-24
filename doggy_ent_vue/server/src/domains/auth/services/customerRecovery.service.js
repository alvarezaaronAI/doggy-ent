import { APIError } from 'better-auth/api'
import { getEmailProviderStatus, queueEmail } from '../../emails/services/emailProvider.service.js'

export function getCustomerRecoveryReadiness() {
  return { passwordResetAvailable: getEmailProviderStatus().live === true }
}

export async function deliverCustomerPasswordReset(payload) {
  if (!getCustomerRecoveryReadiness().passwordResetAvailable) {
    throw new APIError('SERVICE_UNAVAILABLE', { message: 'Password reset email is not available right now.' })
  }
  const result = await queueEmail(payload)
  if (result.status !== 'SENT' && !(result.status === 'DUPLICATE' && result.delivery?.status === 'SENT')) {
    throw new APIError('SERVICE_UNAVAILABLE', { message: 'Unable to request a reset link right now.' })
  }
}
