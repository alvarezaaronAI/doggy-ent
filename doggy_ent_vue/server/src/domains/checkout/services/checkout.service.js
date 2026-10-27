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
import { resolveCheckoutItems } from './checkoutCatalog.service.js'
import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'
import { assertUsDestination } from '../../../shared/utils/usAddress.js'
import { validateTaxSnapshot } from '../../../shared/utils/taxSnapshot.js'
import { checkoutQuoteHash, checkoutChangedAfterPayment } from '../utils/checkoutQuote.js'


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
  assertUsDestination(customer)
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
    logOperationalFailure('CHECKOUT_SHIPPING_RATES_FAILED', error)
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
    const selectedRate = rates.source === 'SHIPPO'
      ? rates.options.find(option => option.rateId === selectedRateId)
      : null

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
    throw Object.assign(new Error('Your selected delivery rate is no longer available. Choose a delivery option again before paying.'), { statusCode: 409 })
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

export async function previewCheckout(checkoutInput = {}, { trustedItems = null, includeTaxSnapshot = false, paymentTax = null, expectedQuoteHash = null } = {}) {
  const {
    cartItems: inputItems = [],
    promoCode = null,
    customerEmail = null,
    customer = {},
    shipping = {},
  } = checkoutInput
  assertUsDestination(customer)
  const cartItems = trustedItems || await resolveCheckoutItems(inputItems)
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
  const quoteHash = checkoutQuoteHash({ cartItems, discountAmount, shippingAmount, shipping: resolvedShipping, customer, promoCode })
  // A paid checkout reuses its signed tax calculation, never a new provider quote.
  if (paymentTax && quoteHash !== expectedQuoteHash) throw checkoutChangedAfterPayment()
  const taxResult = paymentTax ? validateTaxSnapshot(paymentTax) : await calculateTax({
    cartItems, subtotal, discountAmount, shippingAmount, customer,
  })

  const tax = normalizeCurrencyAmount(
    taxResult.taxAmount || 0,
  )
  const total = normalizeCurrencyAmount(
    taxableAmount + tax,
  )

  const response = buildCheckoutResponse({
    subtotal,
    shippingAmount,
    discountAmount,
    donationAmount,
    tax,
    taxSnapshot: taxResult,
    total,
    promoResult,
    campaignPreview,
    shipping: resolvedShipping,
  })
  return includeTaxSnapshot ? { ...response, taxSnapshot: taxResult, quoteHash } : response
}

export async function createCheckout(
  checkoutInput = {},
  {
    customerUser = null,
    paymentTax = null,
    expectedQuoteHash = null,
  } = {},
) {
  const usedPayment = await findOrderByStripePaymentIntentId(String(checkoutInput.stripePaymentIntentId || '').trim())
  if (usedPayment) {
    if (normalizeEmail(checkoutInput.customer?.email || checkoutInput.customerEmail) !== normalizeEmail(usedPayment.customerEmail)) throw Object.assign(new Error('This payment already belongs to another order.'), { statusCode: 409 })
    return { order: usedPayment, pricing: { subtotal: usedPayment.subtotal, discountAmount: usedPayment.discountAmount, shippingAmount: usedPayment.shippingAmount, taxAmount: usedPayment.taxAmount, total: usedPayment.total } }
  }
  const trustedItems = await resolveCheckoutItems(checkoutInput.cartItems)
  checkoutInput = { ...checkoutInput, cartItems: trustedItems }
  const checkoutPreview = await previewCheckout(checkoutInput, { trustedItems, includeTaxSnapshot: true, paymentTax, expectedQuoteHash })

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
    ...(paymentTax ? { expectedTaxCalculationId: paymentTax.calculationId || null } : {}),
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
    taxSnapshot: checkoutPreview.taxSnapshot?.version === 1 ? validateTaxSnapshot(checkoutPreview.taxSnapshot) : null,
    promoCode: checkoutPreview.promo?.code || null,
    stripePaymentIntentId,
    userId: customerUser?.id || null,
  }, { verifiedCheckout: true })

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
      logOperationalFailure('CHECKOUT_PROMO_USAGE_FAILED', error)
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
      logOperationalFailure('CHECKOUT_CAMPAIGN_USAGE_FAILED', error)
    }
  }


  return {
    ...checkoutPreview,
    promo: recordedPromo,
    order,
  }
}
