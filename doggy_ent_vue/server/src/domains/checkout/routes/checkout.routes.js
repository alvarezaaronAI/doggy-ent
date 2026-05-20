import express from 'express'

import {
  previewCheckoutController,
  createCheckoutController,
} from '../controllers/checkout.controller.js'

const router = express.Router()

router.post('/preview', previewCheckoutController)

router.post('/', createCheckoutController)

export default router