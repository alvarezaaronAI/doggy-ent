import {
  ACCOUNT_STATUS,
} from '../../../domains/auth/constants/authRoles.constants.js'
import {
  getCustomerSessionFromRequest,
} from '../../../domains/auth/services/customerAuth.service.js'

export async function requireCustomerAuth(req, res, next) {
  try {
    const session = await getCustomerSessionFromRequest(req)

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: 'Customer authentication required.',
      })
    }

    if (session.user.status === ACCOUNT_STATUS.DEACTIVATED) {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive.',
      })
    }

    req.customerSession = session.session
    req.customerUser = session.user

    return next()
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to validate customer session.',
    })
  }
}
