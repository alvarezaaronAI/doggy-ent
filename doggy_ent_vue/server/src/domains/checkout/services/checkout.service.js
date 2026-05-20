import {
  validatePromoCode,
  recordPromoUsage,
} from '../../promos/services/promos.service.js'
import {
  previewCampaignDonations,
} from '../../admin/services/campaigns.service.js'
import { calculateTax } from '../../../shared/services/tax.service.js'
import { createNewOrder } from '../../orders/services/orders.service.js'

function calculateSubtotal(cartItems = []) {
  return cartItems.reduce((total, item) => {
    const price = Number(item.price || 0)
    const quantity = Number(item.quantity || 0)
    return total + price * quantity
  }, 0)
}

function calculateShipping(shipping = {}) {
  return Number(shipping.price || 0)
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
  order = null,
}) {
  return {
    success: true,
    pricing: {
      subtotal,
      shippingAmount,
      discountAmount,
      donationAmount,
      tax,
      total,
    },
    promo: promoResult,
    campaigns: campaignPreview,
    order,
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

  const discountAmount = promoResult?.valid ? Number(promoResult.discountAmount || 0) : 0

  const campaignPreview = await previewCampaignDonations(cartItems)
  const donationAmount = campaignPreview.reduce(
    (totalDonation, campaign) => totalDonation + Number(campaign.donationAmount || 0),
    0
  )

  const taxableAmount = Math.max(0, subtotal - discountAmount + shippingAmount)

  const taxResult = await calculateTax({
    taxableAmount,
    customer,
  })

  const tax = Number(taxResult.taxAmount || 0)
  const total = taxableAmount + tax

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
    stripePaymentIntentId: checkoutInput.stripePaymentIntentId || null,
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
