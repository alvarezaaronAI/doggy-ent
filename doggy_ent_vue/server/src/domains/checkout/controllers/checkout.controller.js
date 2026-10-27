import { apiError } from '../../../shared/utils/apiError.js'
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
import { signCapability, readCapability } from '../../../shared/utils/signedCapability.js'
import { mapCustomerOrder } from '../../orders/mappers/orders.mapper.js'

function handleCheckoutError(res, error, fallbackMessage) {
  if (error?.code === 'TAX_UNAVAILABLE') {
    return res.status(503).json({ success: false, message: 'Tax could not be calculated. Review your delivery address and try again. If payment already completed, do not pay again; contact support.' })
  }
  const failure = apiError(error, fallbackMessage)
  return res.status(failure.statusCode).json({
    success: false,
    message: failure.message,
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
    const paymentProof = readCapability(req.body?.checkoutProof, 'checkout-payment')
    const email = String(req.body?.customer?.email || req.body?.customerEmail || '').trim().toLowerCase()
    if (!paymentProof || paymentProof.paymentIntentId !== req.body?.stripePaymentIntentId || paymentProof.email !== email) {
      return res.status(400).json({ success: false, message: 'This checkout could not be verified. If payment completed, do not pay again; contact support with your payment reference.' })
    }
    if (paymentProof.taxVersion !== undefined && (paymentProof.taxVersion !== 1 || !paymentProof.taxSnapshot || !/^[a-f0-9]{64}$/.test(paymentProof.quoteHash || ''))) {
      return res.status(400).json({ success: false, message: 'The checkout tax details could not be verified. If payment completed, do not pay again; contact support.' })
    }
    const customerUser = await getCustomerUserFromRequest(req)
    const result = await createCheckout(req.body, {
      customerUser,
      ...(paymentProof.taxVersion === 1 ? { paymentTax: paymentProof.taxSnapshot, expectedQuoteHash: paymentProof.quoteHash } : {}),
    })
    const reference = result.order?.orderNumber
    res.set('Cache-Control', 'no-store')
    const receiptAccess = reference ? signCapability('order-receipt', { reference }, 24 * 60 * 60 * 1000) : null

    return res.json({
      success: true,
      result: { pricing: result.pricing, promo: result.promo, campaigns: result.campaigns, shipping: result.shipping, order: mapCustomerOrder(result.order), receiptAccess },
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
    res.set('Cache-Control', 'no-store')
    const proof = readCapability(req.get('X-Order-Receipt'), 'order-receipt')
    const customer = await getCustomerUserFromRequest(req)
    const hasProof = proof?.reference === req.params.reference
    if (!hasProof && !customer?.id) return res.status(404).json({ success: false, message: 'Open this order from your checkout confirmation or sign in to your account.' })
    const order = await fetchCustomerOrderByReference(
      req.params.reference,
      hasProof ? { viewerId: customer?.id } : { userId: customer.id, viewerId: customer.id },
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
