

import {
  previewCheckout,
  createCheckout,
} from '../services/checkout.service.js'

export async function previewCheckoutController(req, res) {
  try {
    const result = await previewCheckout(req.body)

    return res.json(result)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Checkout preview failed.',
    })
  }
}

export async function createCheckoutController(req, res) {
  try {
    const result = await createCheckout(req.body)

    return res.json(result)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Checkout failed.',
    })
  }
}