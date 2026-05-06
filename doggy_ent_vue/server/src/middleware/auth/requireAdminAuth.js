

import {
  getAdminFromSession,
  getSessionCookieName,
} from '../../services/auth/auth.service.js'

export async function requireAdminAuth(req, res, next) {
  try {
    const sessionId = req.cookies?.[getSessionCookieName()]

    const admin = await getAdminFromSession(sessionId)

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    req.admin = admin

    return next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to validate admin session.',
    })
  }
}