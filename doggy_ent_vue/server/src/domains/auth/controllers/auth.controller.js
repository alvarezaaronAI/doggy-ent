import { loginAdmin, logoutAdmin, getAdminFromRequest, getAdminDataTarget, forwardAuthCookies } from '../services/auth.service.js'

export async function loginAdminController(req, res) {
  try {
    const result = await loginAdmin(req.body, req)
    forwardAuthCookies(res, result.headers)
    res.clearCookie('doggy_admin_session', { path: '/', httpOnly: true })
    return res.json({ success: true, admin: result.admin })
  } catch (error) {
    const code = error.statusCode === 400 ? 400 : error.statusCode === 401 || error.status === 'UNAUTHORIZED' || error.status === 'FORBIDDEN' ? 401 : 500
    return res.status(code).json({ success: false, message: code === 400 ? 'Enter a valid email and password.' : code === 401 ? 'Invalid admin credentials.' : 'Unable to sign in.' })
  }
}

export async function logoutAdminController(req, res) {
  try {
    const result = await logoutAdmin(req)
    forwardAuthCookies(res, result.headers)
    res.clearCookie('doggy_admin_session', { path: '/', httpOnly: true })
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to sign out. Please try again.' })
  }
}

async function adminContext(req, res, dataTarget) {
  try {
    const admin = await getAdminFromRequest(req)
    if (!admin) return res.status(401).json({ success: false, authenticated: false })
    return res.json(dataTarget
      ? { success: true, target: getAdminDataTarget() }
      : { success: true, authenticated: true, admin })
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to validate admin session.' })
  }
}

export const getAdminMeController = (req, res) => adminContext(req, res, false)
export const getAdminDataTargetController = (req, res) => adminContext(req, res, true)
