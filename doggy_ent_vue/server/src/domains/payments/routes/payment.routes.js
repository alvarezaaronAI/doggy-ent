

import express from 'express'

import { createPaymentIntent } from '../controllers/payment.controller.js'
import {
  paymentRateLimiter,
} from '../../../app/middleware/security/rateLimit.middleware.js'

const router = express.Router()

router.post('/create-payment-intent', paymentRateLimiter, createPaymentIntent)

export default router
