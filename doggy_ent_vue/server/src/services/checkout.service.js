import { validatePromoCode } from './admin/promos.service.js'
import { previewCampaignDonations } from './admin/campaigns.service.js'
import { calculateTax } from './tax.service.js'
import { createOrder } from './admin/orders.service.js'

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
    customer = {},
    shipping = {},
  } = checkoutInput

  const order = await createOrder({
    cartItems,
    customer,
    shipping,
    pricing: checkoutPreview.pricing,
    promo: checkoutPreview.promo,
    campaigns: checkoutPreview.campaigns,
  })

  return {
    ...checkoutPreview,
    order,
  }
}
