import {
  previewCheckout,
  createCheckout,
} from '../services/checkout.service.js'

function handleCheckoutError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  })
}

export async function previewCheckoutController(req, res) {
  try {
    const result = await previewCheckout(req.body)

    return res.json({
      success: true,
      result,
    })
  } catch (error) {
    return handleCheckoutError(
      res,
      error,
      'Checkout preview failed.',
    )
  }
}

export async function createCheckoutController(req, res) {
  try {
    const result = await createCheckout(req.body)

    return res.json({
      success: true,
      result,
    })
  } catch (error) {
    return handleCheckoutError(
      res,
      error,
      'Checkout failed.',
    )
  }
}