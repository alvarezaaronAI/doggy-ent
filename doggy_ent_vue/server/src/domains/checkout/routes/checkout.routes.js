import express from 'express'

import {
  previewCheckoutController,
  createCheckoutController,
  getCheckoutShippingOptionsController,
  postCheckoutShippingRatesController,
  getCheckoutOrderController,
} from '../controllers/checkout.controller.js'
import {
  checkoutRateLimiter,
} from '../../../app/middleware/security/rateLimit.middleware.js'

const router = express.Router()

router.get('/shipping-options', getCheckoutShippingOptionsController)
router.post('/shipping-rates', checkoutRateLimiter, postCheckoutShippingRatesController)

// Preview trusted checkout totals before payment.
router.post('/preview', checkoutRateLimiter, previewCheckoutController)

// Create finalized checkout using backend trusted pricing.
router.post('/', checkoutRateLimiter, createCheckoutController)

// Load customer-safe order confirmation details.
router.get('/orders/:reference', getCheckoutOrderController)

export default router
