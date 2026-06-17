import express from 'express'

import {
  getAdminOrderById,
  getAdminOrders,
  getAdminOrderStats,
  patchAdminOrderStatus,
  postAdminOrderEmailResend,
} from '../controllers/orders.controller.js'
import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'

const router = express.Router()

router.use(requireAdminAuth)

router.get('/', getAdminOrders)
router.get('/stats', getAdminOrderStats)
router.get('/:orderId', getAdminOrderById)
router.patch('/:orderId/status', patchAdminOrderStatus)
router.post('/:orderId/emails/resend', postAdminOrderEmailResend)

export default router
