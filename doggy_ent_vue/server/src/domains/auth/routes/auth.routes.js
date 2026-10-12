import { Router } from 'express'
import { adminLoginRateLimiter } from '../../../app/middleware/security/rateLimit.middleware.js'
import { loginAdmin, logoutAdmin, getAdminFromRequest, getAdminDataTarget, forwardAuthCookies } from '../services/auth.service.js'

const router = Router()

router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
router.post('/login', adminLoginRateLimiter, async (req, res) => {
  try {
    const result = await loginAdmin(req.body, req)
    forwardAuthCookies(res, result.headers)
    res.clearCookie('doggy_admin_session', { path: '/', httpOnly: true })
    return res.json({ success: true, admin: result.admin })
  } catch (error) {
    const code = error.statusCode === 400 ? 400 : error.statusCode === 401 || error.status === 'UNAUTHORIZED' || error.status === 'FORBIDDEN' ? 401 : 500
    return res.status(code).json({ success: false, message: code === 400 ? 'Enter a valid email and password.' : code === 401 ? 'Invalid admin credentials.' : 'Unable to sign in.' })
  }
})

router.post('/logout', async (req, res) => {
  try {
    const result = await logoutAdmin(req)
    forwardAuthCookies(res, result.headers)
    res.clearCookie('doggy_admin_session', { path: '/', httpOnly: true })
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to sign out. Please try again.' })
  }
})

for (const path of ['/me', '/data-target']) router.get(path, async (req, res) => {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return res.status(401).json({ success: false, authenticated: false })
    return res.json(path === '/me'
      ? { success: true, authenticated: true, admin }
      : { success: true, target: getAdminDataTarget() })
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to validate admin session.' })
  }
})

export default router
