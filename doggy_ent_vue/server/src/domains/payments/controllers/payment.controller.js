import { createStripePaymentIntent } from '../services/stripe.payment.js'
import {
  previewCheckout,
} from '../../checkout/services/checkout.service.js'
import { signCapability } from '../../../shared/utils/signedCapability.js'
import { validateRequiredCheckoutFields } from '../../checkout/validators/checkout.validator.js'

export const createPaymentIntent = async (req, res) => {
  try {
    validateRequiredCheckoutFields({ customer: req.body?.customer })
    const checkoutPreview = await previewCheckout(req.body)

    if (
      req.body?.promoCode
      && checkoutPreview.promo
      && !checkoutPreview.promo.valid
    ) {
      return res.status(400).json({
        success: false,
        message:
          checkoutPreview.promo.message || 'Invalid promo code.',
      })
    }

    const amount = checkoutPreview.pricing.total

    const paymentIntent = await createStripePaymentIntent({
      amount,
    })

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      checkoutProof: signCapability('checkout-payment', { paymentIntentId: paymentIntent.id, email: String(req.body?.customer?.email || req.body?.customerEmail || '').trim().toLowerCase() }, 24 * 60 * 60 * 1000),
      pricing: checkoutPreview.pricing,
    })
  } catch (error) {
    console.error('Payment controller error:', error)


    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || 'Failed to create payment intent.',
    })
  }
}
