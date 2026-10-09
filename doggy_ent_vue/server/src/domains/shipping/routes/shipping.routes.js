import express from 'express'
import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'
import {
  webhookRateLimiter,
} from '../../../app/middleware/security/rateLimit.middleware.js'
import {
  postAdminOrderTrackingRefresh,
  getAdminShipmentsController,
  postShippoWebhook,
  putAdminOrderTracking,
} from '../controllers/shipping.controller.js'

const router = express.Router()

router.post('/webhooks/shippo', webhookRateLimiter, postShippoWebhook)

router.put(
  '/admin/orders/:orderId/tracking',
  requireAdminAuth,
  putAdminOrderTracking,
)

router.post(
  '/admin/orders/:orderId/tracking/refresh',
  requireAdminAuth,
  postAdminOrderTrackingRefresh,
)

router.get(
  '/admin/shipments',
  requireAdminAuth,
  getAdminShipmentsController,
)

export default router
