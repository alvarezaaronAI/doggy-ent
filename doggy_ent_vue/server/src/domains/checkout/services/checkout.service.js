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
  EMAIL_EVENTS,
} from '../../emails/constants/emailEvents.constants.js'
import {
  buildAdminOrderEmailPayload,
  buildOrderEmailPayload,
} from '../../emails/mappers/emailPayloads.mapper.js'
import {
  queueEmail,
} from '../../emails/services/emailProvider.service.js'

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
  buildStaticShippingOption,
  calculateCheckoutDiscountAmount,
  calculateCheckoutDonationAmount,
  calculateShipping,
  calculateSubtotal,
} from '../utils/checkoutPricing.js'
import {
  fetchShippoRates,
} from '../../shipping/services/shippo.service.js'
import {
  validateCheckoutSubmissionState,
  validateFinalizedCheckoutPreview,
  validateRequiredCheckoutFields,
} from '../validators/checkout.validator.js'

async function queueCheckoutEmails(order) {
  if (!order?.id) {
    return
  }

  await Promise.allSettled([
    queueEmail(
      buildOrderEmailPayload({
        event: EMAIL_EVENTS.ORDER_CONFIRMATION,
        order,
      }),
    ),
    queueEmail(
      buildAdminOrderEmailPayload({
        event: EMAIL_EVENTS.ADMIN_NEW_ORDER,
        order,
        message: 'A new paid checkout order was created.',
      }),
    ),
  ])
}

function hasRateAddress(customer = {}) {
  return [
    customer.address1,
    customer.city,
    customer.state,
    customer.zip,
  ].every((value) => String(value || '').trim())
}

function getStaticShippingOptions() {
  return [
    buildStaticShippingOption('standard'),
    buildStaticShippingOption('priority'),
  ]
}

export async function fetchCheckoutShippingRates({
  customer = {},
  cartItems = [],
} = {}) {
  if (!hasRateAddress(customer)) {
    return {
      source: 'STATIC',
      defaultMethod: 'standard',
      options: getStaticShippingOptions(),
      message: 'Complete the shipping address to check live carrier rates.',
    }
  }

  try {
    const shippoResult = await fetchShippoRates({
      customer,
      cartItems,
    })

    if (shippoResult.rates?.length) {
      return {
        source: 'SHIPPO',
        defaultMethod: shippoResult.rates[0].code,
        options: shippoResult.rates,
      }
    }
  }
  catch (error) {
    console.error(
      '[checkout] Shippo rate shopping failed:',
      error.safeMessage || error.message,
    )
  }

  return {
    source: 'STATIC',
    defaultMethod: 'standard',
    options: getStaticShippingOptions(),
    message: 'Carrier rates are unavailable. Store shipping rates are shown.',
  }
}

async function resolveCheckoutShipping({
  shipping = {},
  customer = {},
  cartItems = [],
} = {}) {
  const selectedRateId = String(shipping.rateId || '').trim()

  if (selectedRateId) {
    const rates = await fetchCheckoutShippingRates({
      customer,
      cartItems,
    })
    const selectedRate = rates.options.find((option) =>
      option.rateId === selectedRateId
      || option.code === shipping.method,
    )

    if (selectedRate) {
      return {
        amount: normalizeCurrencyAmount(selectedRate.price),
        method: selectedRate.code || selectedRate.method,
        carrier: selectedRate.carrier || null,
        service: selectedRate.service || selectedRate.label || null,
        rateId: selectedRate.rateId || null,
        provider: selectedRate.provider || rates.source || 'SHIPPO',
      }
    }
  }

  const staticOption = buildStaticShippingOption(shipping.method)

  return {
    amount: calculateShipping(shipping),
    method: staticOption.method,
    carrier: staticOption.carrier,
    service: staticOption.service,
    rateId: staticOption.rateId,
    provider: staticOption.provider,
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
  const normalizedCustomerEmail = normalizeEmail(
    customer.email || customerEmail,
  )

  if (!Array.isArray(cartItems) || !cartItems.length) {
    const error = new Error('Cart items are required.')
    error.statusCode = 400
    throw error
  }

  const subtotal = calculateSubtotal(cartItems)
  const resolvedShipping = await resolveCheckoutShipping({
    shipping,
    customer,
    cartItems,
  })
  const shippingAmount = resolvedShipping.amount

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
    shipping: resolvedShipping,
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
    shippingMethod: String(
      checkoutPreview.shipping?.method || shipping.method || '',
    ).trim() || null,
    shippingCarrier: checkoutPreview.shipping?.carrier || null,
    shippingService: checkoutPreview.shipping?.service || null,
    shippingRateId: checkoutPreview.shipping?.rateId || null,
    shippingRateProvider: checkoutPreview.shipping?.provider || null,
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

  queueCheckoutEmails(order).catch((error) => {
    console.error(
      '[checkout] Failed checkout email dispatch.',
      error,
    )
  })

  return {
    ...checkoutPreview,
    promo: recordedPromo,
    order,
  }
}
