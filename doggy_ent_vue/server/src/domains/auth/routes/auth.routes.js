import { Router } from 'express'
import { adminLoginRateLimiter } from '../../../app/middleware/security/rateLimit.middleware.js'
import { requireAdminGateway } from '../../../app/middleware/auth/requireAdminGateway.js'
import { loginAdminController, logoutAdminController, getAdminMeController, getAdminDataTargetController } from '../controllers/auth.controller.js'

const router = Router()

router.use(requireAdminGateway)
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
router.post('/login', adminLoginRateLimiter, loginAdminController)
router.post('/logout', logoutAdminController)
router.get('/me', getAdminMeController)
router.get('/data-target', getAdminDataTargetController)

export default router
