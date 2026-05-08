import express from 'express'

import { previewCheckout, createCheckout } from '../services/checkout.service.js'

const router = express.Router()

router.post('/preview', async (req, res) => {
  try {
    const result = await previewCheckout(req.body)
    return res.json(result)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Checkout preview failed.',
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const result = await createCheckout(req.body)
    return res.json(result)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Checkout failed.',
    })
  }
})

export default router