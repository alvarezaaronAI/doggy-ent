import express from 'express'

import {
  previewCheckoutController,
  createCheckoutController,
} from '../controllers/checkout.controller.js'

const router = express.Router()

// Preview trusted checkout totals before payment.
router.post('/preview', previewCheckoutController)

// Create finalized checkout using backend trusted pricing.
router.post('/', createCheckoutController)

export default router