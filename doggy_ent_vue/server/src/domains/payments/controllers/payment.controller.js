import { createStripePaymentIntent } from '../services/stripe.payment.js'
import {
  previewCheckout,
} from '../../checkout/services/checkout.service.js'
import {
  buildAdminFailedPaymentEmail,
} from '../../emails/mappers/emailPayloads.mapper.js'
import {
  queueEmail,
} from '../../emails/services/emailProvider.service.js'

export const createPaymentIntent = async (req, res) => {
  try {
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
      pricing: checkoutPreview.pricing,
    })
  } catch (error) {
    console.error('Payment controller error:', error)

    queueEmail(
      buildAdminFailedPaymentEmail({
        customerEmail:
          req.body?.customer?.email
          || req.body?.customerEmail
          || null,
        message: error.message || 'Payment intent creation failed.',
      }),
    ).catch((emailError) => {
      console.error(
        '[payments] Failed admin payment failure email dispatch.',
        emailError,
      )
    })

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || 'Failed to create payment intent.',
    })
  }
}
