import { createStripePaymentIntent } from '../services/stripe.payment.js'
import {
  previewCheckout,
} from '../../checkout/services/checkout.service.js'
import { signCapability } from '../../../shared/utils/signedCapability.js'
import { validateRequiredCheckoutFields } from '../../checkout/validators/checkout.validator.js'
import { apiError } from '../../../shared/utils/apiError.js'
import { assertPaymentRequestMode } from '../config/payment.config.js'
import { validateTaxSnapshot } from '../../../shared/utils/taxSnapshot.js'

export const createPaymentIntent = async (req, res) => {
  try {
    validateRequiredCheckoutFields({ customer: req.body?.customer })
    assertPaymentRequestMode(req.body?.paymentMode)
    const checkoutPreview = await previewCheckout(req.body, { includeTaxSnapshot: true })

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
    const email = String(req.body?.customer?.email || req.body?.customerEmail || '').trim().toLowerCase()
    const taxProof = checkoutPreview.taxSnapshot?.version === 1
      ? { taxVersion: 1, taxSnapshot: validateTaxSnapshot(checkoutPreview.taxSnapshot), quoteHash: checkoutPreview.quoteHash }
      : {}
    if (signCapability('checkout-payment', { paymentIntentId: 'pi_' + 'x'.repeat(128), email, ...taxProof }, 24 * 60 * 60 * 1000).length > 6000) {
      throw Object.assign(new Error('Tax details could not be prepared for this order.'), { code: 'TAX_UNAVAILABLE' })
    }

    const paymentIntent = await createStripePaymentIntent({
      amount,
      paymentMode: req.body.paymentMode,
      ...(taxProof.taxSnapshot?.calculationId ? { taxCalculationId: taxProof.taxSnapshot.calculationId } : {}),
    })

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      checkoutProof: signCapability('checkout-payment', { paymentIntentId: paymentIntent.id, email, ...taxProof }, 24 * 60 * 60 * 1000),
      pricing: checkoutPreview.pricing,
    })
  } catch (error) {
    if (error.code === 'TAX_UNAVAILABLE') {
      return res.status(503).json({ success: false, message: 'Tax could not be calculated. Review your delivery address and try again.' })
    }
    if (error.code === 'PAYMENT_ENVIRONMENT_UNAVAILABLE') {
      return res.status(503).json({ success: false, message: 'Secure checkout is temporarily unavailable. Please try again later.' })
    }
    const failure = apiError(error, 'Unable to start secure payment. Please try again.')
    return res.status(failure.statusCode).json({
      success: false,
      message:
        failure.message,
    })
  }
}
