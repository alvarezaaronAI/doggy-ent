

import {
  getAdminFromRequest,
} from '../../../domains/auth/services/auth.service.js'
import { logAdminAction } from '../../../shared/utils/operationalLog.js'

export async function requireAdminAuth(req, res, next) {
  try {
    const admin = await getAdminFromRequest(req)

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    res.set('Cache-Control', 'no-store')
    req.admin = admin
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) res.once?.('finish', () => logAdminAction(req, res.statusCode))

    return next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to validate admin session.',
    })
  }
}
