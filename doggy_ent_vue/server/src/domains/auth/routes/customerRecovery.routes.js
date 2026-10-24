import { Router } from 'express'
import { getCustomerRecoveryReadinessController, requireCustomerResetDelivery } from '../controllers/customerRecovery.controller.js'
const router = Router()
router.get('/readiness', getCustomerRecoveryReadinessController)
router.post('/request-password-reset', requireCustomerResetDelivery)
export default router
