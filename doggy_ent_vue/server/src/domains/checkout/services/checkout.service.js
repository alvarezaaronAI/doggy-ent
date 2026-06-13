import {
  validatePromoCode,
  recordPromoUsage,
} from '../../promos/services/promos.service.js'
import {
  previewCampaignDonations,
  recordCampaignDonationUsage,
} from '../../campaigns/services/campaigns.service.js'
import { calculateTax } from '../../../shared/services/tax.service.js'
import { createNewOrder } from '../../orders/services/orders.service.js'

import {
  validateStripePaymentIntent,
} from '../../payments/services/stripe.payment.js'

import {
  findOrderByStripePaymentIntentId,
} from '../../orders/repositories/orders.repository.js'
import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  normalizeEmail,
} from '../../../shared/utils/string.js'
import {
  buildCheckoutResponse,
} from '../mappers/checkout.mapper.js'
import {
  calculateCheckoutDiscountAmount,
  calculateCheckoutDonationAmount,
  calculateShipping,
  calculateSubtotal,
} from '../utils/checkoutPricing.js'
import {
  validateCheckoutSubmissionState,
  validateFinalizedCheckoutPreview,
  validateRequiredCheckoutFields,
} from '../validators/checkout.validator.js'

export async function previewCheckout(checkoutInput = {}) {
  const {
    cartItems = [],
    promoCode = null,
    customerEmail = null,
    customer = {},
    shipping = {},
  } = checkoutInput
  const normalizedCustomerEmail = normalizeEmail(
    customer.email || customerEmail,
  )

  if (!Array.isArray(cartItems) || !cartItems.length) {
    const error = new Error('Cart items are required.')
    error.statusCode = 400
    throw error
  }

  const subtotal = calculateSubtotal(cartItems)
  const shippingAmount = calculateShipping(shipping)

  let promoResult = null
  if (promoCode) {
    promoResult = await validatePromoCode({
      code: promoCode,
      customerEmail: normalizedCustomerEmail,
      cart: {
        subtotal,
        items: cartItems,
      },
    })
  }

  const discountAmount = calculateCheckoutDiscountAmount(
    promoResult,
  )

  const campaignPreview = await previewCampaignDonations(cartItems)
  const donationAmount = calculateCheckoutDonationAmount(
    campaignPreview,
  )

  const taxableAmount = Math.max(0, subtotal - discountAmount + shippingAmount)

  const taxResult = await calculateTax({
    taxableAmount,
    customer,
  })

  const tax = normalizeCurrencyAmount(
    taxResult.taxAmount || 0,
  )
  const total = normalizeCurrencyAmount(
    taxableAmount + tax,
  )

  return buildCheckoutResponse({
    subtotal,
    shippingAmount,
    discountAmount,
    donationAmount,
    tax,
    total,
    promoResult,
    campaignPreview,
  })
}

export async function createCheckout(
  checkoutInput = {},
  {
    customerUser = null,
  } = {},
) {
  const checkoutPreview = await previewCheckout(checkoutInput)

  validateRequiredCheckoutFields({
    customer: checkoutInput.customer,
  })

  validateCheckoutSubmissionState({
    stripePaymentIntentId:
      checkoutInput.stripePaymentIntentId,
  })

  validateFinalizedCheckoutPreview(
    checkoutPreview,
  )

  const stripePaymentIntentId = String(
    checkoutInput.stripePaymentIntentId || '',
  ).trim()

  const paymentIntentAlreadyUsed =
    await findOrderByStripePaymentIntentId(
      stripePaymentIntentId,
    )

  if (paymentIntentAlreadyUsed) {
    const requestEmail = normalizeEmail(
      checkoutInput.customer?.email ||
      checkoutInput.customerEmail ||
      '',
    )

    const orderEmail = normalizeEmail(
      paymentIntentAlreadyUsed.customerEmail || '',
    )

    if (!requestEmail || requestEmail !== orderEmail) {
      const error = new Error(
        'This Stripe payment has already been used for an order.',
      )

      error.statusCode = 409

      throw error
    }

    return {
      ...checkoutPreview,
      order: paymentIntentAlreadyUsed,
    }
  }

  const {
    cartItems = [],
    promoCode = null,
    customerEmail = null,
    customer = {},
    shipping = {},
  } = checkoutInput
  const normalizedCustomerEmail = normalizeEmail(
    customer.email || customerEmail,
  )

  if (
    promoCode
    && checkoutPreview.promo
    && !checkoutPreview.promo.valid
  ) {
    const error = new Error(
      checkoutPreview.promo.message || 'Invalid promo code.',
    )

    error.statusCode = 400

    throw error
  }

  await validateStripePaymentIntent({
    stripePaymentIntentId,
    expectedAmount:
      checkoutPreview.pricing.total,
    expectedCurrency: 'usd',
  })

  if (checkoutInput.completedOrderId) {
    const error = new Error(
      'This checkout session has already been completed.',
    )

    error.statusCode = 409

    throw error
  }

  const order = await createNewOrder({
    items: cartItems,
    customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    customerEmail: normalizedCustomerEmail || null,
    customerPhone: customer.phone || null,
    deliveryNotes: customer.deliveryNotes || null,
    address1: customer.address1 || null,
    address2: customer.address2 || null,
    city: customer.city || null,
    state: customer.state || null,
    zip: customer.zip || null,
    country: customer.country || 'United States',
    marketingOptIn: Boolean(customer.marketingOptIn),
    saveInfo: Boolean(customer.saveInfo),
    subtotal: checkoutPreview.pricing.subtotal,
    total: checkoutPreview.pricing.total,
    currency: 'usd',
    shippingAmount: checkoutPreview.pricing.shippingAmount,
    discountAmount: checkoutPreview.pricing.discountAmount,
    taxAmount: checkoutPreview.pricing.taxAmount,
    promoCode: checkoutPreview.promo?.code || null,
    stripePaymentIntentId,
    userId: customerUser?.id || null,
  })

  let recordedPromo = checkoutPreview.promo

  if (promoCode && checkoutPreview.promo?.valid) {
    try {
      recordedPromo = await recordPromoUsage({
        code: promoCode,
        customerEmail: normalizedCustomerEmail,
        orderId: order.id,
        cart: {
          subtotal: checkoutPreview.pricing.subtotal,
          items: cartItems,
        },
      })
    }
    catch (error) {
      console.error(
        '[checkout] Failed promo redemption persistence.',
        error,
      )
    }
  }

  if (checkoutPreview.campaigns?.length) {
    try {
      for (const campaign of checkoutPreview.campaigns) {
        await recordCampaignDonationUsage({
          campaignId: campaign.campaignId,
          subtotal: campaign.matchedSubtotal,
          orderId: order.id,
          donationAmount: campaign.donationAmount,
          matchedProductIds: campaign.matchedProductIds,
        })
      }
    }
    catch (error) {
      console.error(
        '[checkout] Failed campaign donation persistence.',
        error,
      )
    }
  }

  return {
    ...checkoutPreview,
    promo: recordedPromo,
    order,
  }
}
