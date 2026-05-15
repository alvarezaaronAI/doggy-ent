

import express from 'express'

import { createPaymentIntent } from '../controllers/payment.controller.js'

const router = express.Router()

router.post('/create-payment-intent', createPaymentIntent)

export default router