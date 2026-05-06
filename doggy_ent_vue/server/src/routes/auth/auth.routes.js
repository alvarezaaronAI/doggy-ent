

import express from 'express'

import {
  loginAdmin,
  logoutAdmin,
  getAdminFromSession,
  getSessionCookieName,
  getSessionCookieOptions,
} from '../../services/auth/auth.service.js'

const router = express.Router()

router.post('/login', async (req, res) => {
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