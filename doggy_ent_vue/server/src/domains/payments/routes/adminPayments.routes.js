import { Router } from 'express'
import { requireAdminAuth } from '../../../app/middleware/auth/requireAdminAuth.js'
import { getAdminPaymentEnvironment } from '../controllers/paymentEnvironment.controller.js'

const router = Router()
router.use(requireAdminAuth)
router.get('/environment', getAdminPaymentEnvironment)
export default router
