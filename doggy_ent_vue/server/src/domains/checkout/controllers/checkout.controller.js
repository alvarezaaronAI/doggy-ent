import {
  previewCheckout,
  createCheckout,
  fetchCheckoutShippingRates,
} from '../services/checkout.service.js'
import {
  DEFAULT_SHIPPING_METHOD,
  SHIPPING_OPTIONS,
} from '../constants/checkout.constants.js'
import {
  fetchCustomerOrderByReference,
} from '../../orders/services/orders.service.js'
import {
  getCustomerUserFromRequest,
} from '../../auth/services/customerAuth.service.js'

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

export async function getCheckoutShippingOptionsController(req, res) {
  return res.json({
    success: true,
    result: {
      defaultMethod: DEFAULT_SHIPPING_METHOD,
      options: Object.values(SHIPPING_OPTIONS),
    },
  })
}

export async function postCheckoutShippingRatesController(req, res) {
  try {
    const result = await fetchCheckoutShippingRates(req.body || {})

    return res.json({
      success: true,
      result,
    })
  } catch (error) {
    return handleCheckoutError(
      res,
      error,
      'Unable to load shipping rates.',
    )
  }
}

export async function createCheckoutController(req, res) {
  try {
    const customerUser = await getCustomerUserFromRequest(req)
    const result = await createCheckout(req.body, {
      customerUser,
    })

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

export async function getCheckoutOrderController(req, res) {
  try {
    const order = await fetchCustomerOrderByReference(
      req.params.reference,
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    return res.json({
      success: true,
      result: order,
    })
  } catch (error) {
    return handleCheckoutError(
      res,
      error,
      'Unable to load order.',
    )
  }
}
