

import express from 'express'
import rateLimit from 'express-rate-limit'

import {
  loginAdmin,
  logoutAdmin,
  getAdminFromSession,
  getSessionCookieName,
  getSessionCookieOptions,
} from '../../services/auth/auth.service.js'


const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
})

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const result = await loginAdmin(req.body)

    res.cookie(
      getSessionCookieName(),
      result.sessionId,
      getSessionCookieOptions()
    )

    return res.json({
      success: true,
      admin: result.admin,
      expiresAt: result.expiresAt,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to login.',
    })
  }
})

router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies?.[getSessionCookieName()]

    await logoutAdmin(sessionId)

    res.clearCookie(
      getSessionCookieName(),
      getSessionCookieOptions()
    )

    return res.json({ success: true })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to logout.',
    })
  }
})

router.get('/me', async (req, res) => {
  try {
    const sessionId = req.cookies?.[getSessionCookieName()]

    const admin = await getAdminFromSession(sessionId)

    if (!admin) {
      return res.status(401).json({
        success: false,
        authenticated: false,
      })
    }

    return res.json({
      success: true,
      authenticated: true,
      admin,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to validate session.',
    })
  }
})

export default router