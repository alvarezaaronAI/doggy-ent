

import express from 'express'

import { createPaymentIntent } from '../controllers/payment.controller.js'
import { getPaymentConfiguration } from '../controllers/paymentEnvironment.controller.js'
import {
  paymentRateLimiter,
} from '../../../app/middleware/security/rateLimit.middleware.js'

const router = express.Router()

router.get('/payment-configuration', paymentRateLimiter, getPaymentConfiguration)
router.post('/create-payment-intent', paymentRateLimiter, createPaymentIntent)

export default router
