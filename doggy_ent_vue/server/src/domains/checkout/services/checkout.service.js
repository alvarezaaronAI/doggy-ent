import {
  validatePromoCode,
  recordPromoUsage,
} from '../../promos/services/promos.service.js'
import {
  previewCampaignDonations,
} from '../../campaigns/services/campaigns.service.js'
import { calculateTax } from '../../../shared/services/tax.service.js'
import { createNewOrder } from '../../orders/services/orders.service.js'

import {
  validateStripePaymentIntent,
} from '../../payments/services/stripe.payment.js'

import {
  stripePaymentIntentAlreadyUsed,
} from '../../orders/repositories/orders.repository.js'

function normalizeCurrencyAmount(value) {
  return Number(
    Number(value || 0).toFixed(2),
  )
}

function calculateSubtotal(cartItems = []) {
  return normalizeCurrencyAmount(
    cartItems.reduce((total, item) => {
      const price = Number(item.price || 0)
      const quantity = Number(item.quantity || 0)

      return total + (price * quantity)
    }, 0),
  )
}

function calculateShipping(shipping = {}) {
  return normalizeCurrencyAmount(
    shipping.price || 0,
  )
}

function calculateDiscountAmount(promoResult) {
  if (!promoResult?.valid) {
    return 0
  }

  return normalizeCurrencyAmount(
    promoResult.discountAmount || 0,
  )
}

function calculateDonationAmount(
  campaignPreview = [],
) {
  return normalizeCurrencyAmount(
    campaignPreview.reduce(
      (totalDonation, campaign) => {
        return (
          totalDonation
          + Number(campaign.donationAmount || 0)
        )
      },
      0,
    ),
  )
}

function buildCheckoutResponse({
  subtotal,
  shippingAmount,
  discountAmount,
  donationAmount,
  tax,
  total,
  promoResult,
  campaignPreview,
}) {
  return {
    pricing: {
      subtotal,
      shippingAmount,
      discountAmount,
      donationAmount,
      tax,
      taxAmount: tax,
      total,
    },

    promo: promoResult,

    campaigns: campaignPreview,
  }
}

function validateCheckoutSubmissionState({
  stripePaymentIntentId,
}) {
  const normalizedPaymentIntentId = String(
    stripePaymentIntentId || '',
  ).trim()

  if (!normalizedPaymentIntentId) {
    const error = new Error(
      'A completed payment is required before checkout.',
    )

    error.statusCode = 400

    throw error
  }
}

function validateRequiredCheckoutFields({
  customer = {},
}) {
  const requiredFields = [
    {
      key: 'firstName',
      label: 'First name',
    },
    {
      key: 'lastName',
      label: 'Last name',
    },
    {
      key: 'email',
      label: 'Email address',
    },
    {
      key: 'address1',
      label: 'Shipping address',
    },
    {
      key: 'city',
      label: 'City',
    },
    {
      key: 'state',
      label: 'State',
    },
    {
      key: 'zip',
      label: 'ZIP code',
    },
    {
      key: 'country',
      label: 'Country',
    },
  ]

  for (const field of requiredFields) {
    const value = String(
      customer[field.key] || '',
    ).trim()

    if (!value) {
      const error = new Error(
        `${field.label} is required.`,
      )

      error.statusCode = 400

      throw error
    }
  }

  const normalizedEmail = String(
    customer.email || '',
  ).trim()

  if (!normalizedEmail.includes('@')) {
    const error = new Error(
      'A valid email address is required.',
    )

    error.statusCode = 400

    throw error
  }
}

function validateFinalizedCheckoutPreview(
  checkoutPreview,
) {
  if (!checkoutPreview?.pricing) {
    const error = new Error(
      'Checkout pricing preview is required.',
    )

    error.statusCode = 400

    throw error
  }

  if (
    Number(checkoutPreview.pricing.total || 0)
    <= 0
  ) {
    const error = new Error(
      'Checkout total must be greater than zero.',
    )

    error.statusCode = 400

    throw error
  }
}

export async function previewCheckout(checkoutInput = {}) {
  const {
    cartItems = [],
    promoCode = null,
    customerEmail = null,
    customer = {},
    shipping = {},
  } = checkoutInput

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
      customerEmail,
      cart: {
        subtotal,
        items: cartItems,
      },
    })
  }

  const discountAmount = calculateDiscountAmount(
    promoResult,
  )

  const campaignPreview = await previewCampaignDonations(cartItems)
  const donationAmount = calculateDonationAmount(
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

export async function createCheckout(checkoutInput = {}) {
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

  const stripePaymentIntentId =
    checkoutInput.stripePaymentIntentId

  const paymentIntentAlreadyUsed =
    await stripePaymentIntentAlreadyUsed(
      stripePaymentIntentId,
    )

  if (paymentIntentAlreadyUsed) {
    const error = new Error(
      'This Stripe payment has already been used for an order.',
    )

    error.statusCode = 409

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

  const {
    cartItems = [],
    promoCode = null,
    customerEmail = null,
    customer = {},
    shipping = {},
  } = checkoutInput

  const order = await createNewOrder({
    items: cartItems,
    customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    customerEmail: customer.email || customerEmail || null,
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
    taxAmount: checkoutPreview.pricing.tax,
    promoCode: checkoutPreview.promo?.code || null,
    stripePaymentIntentId:
      stripePaymentIntentId || null,
  })

  if (
    promoCode
    && checkoutPreview.promo
    && !checkoutPreview.promo.valid
  ) {
    const error = new Error(checkoutPreview.promo.message || 'Invalid promo code.')
    error.statusCode = 400
    throw error
  }

  let recordedPromo = checkoutPreview.promo

  if (promoCode && checkoutPreview.promo?.valid) {
    try {
      recordedPromo = await recordPromoUsage({
        code: promoCode,
        customerEmail,
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

      throw error
    }
  }

  return {
    ...checkoutPreview,
    promo: recordedPromo,
    order,
  }
}
