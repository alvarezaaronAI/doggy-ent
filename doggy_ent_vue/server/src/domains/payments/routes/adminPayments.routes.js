import { Router } from 'express'
import { requireAdminAuth } from '../../../app/middleware/auth/requireAdminAuth.js'
import { getAdminPaymentEnvironment, getAdminTaxReadiness } from '../controllers/paymentEnvironment.controller.js'
import { recoveryEnabled } from '../../checkout/utils/checkoutAttempt.js'
import { listRecoveryCases } from '../../checkout/repositories/checkoutAttempt.repository.js'

const router = Router()
router.use(requireAdminAuth)
router.get('/environment', getAdminPaymentEnvironment)
router.get('/tax', getAdminTaxReadiness)
router.get('/recovery', async (_req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    const enabled = recoveryEnabled()
    return res.json({ success: true, enabled, cases: enabled ? await listRecoveryCases() : [] })
  } catch {
    return res.status(503).json({ success: false, message: 'Payment review cases could not be loaded.' })
  }
})
export default router
