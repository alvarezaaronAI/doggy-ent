import express from 'express'

import {
  previewCheckoutController,
  createCheckoutController,
  getCheckoutOrderController,
} from '../controllers/checkout.controller.js'

const router = express.Router()

// Preview trusted checkout totals before payment.
router.post('/preview', previewCheckoutController)

// Create finalized checkout using backend trusted pricing.
router.post('/', createCheckoutController)

// Load customer-safe order confirmation details.
router.get('/orders/:reference', getCheckoutOrderController)

export default router
