export function buildCheckoutResponse({
  subtotal,
  shippingAmount,
  discountAmount,
  donationAmount,
  tax,
  total,
  promoResult,
  campaignPreview,
  shipping = null,
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
    shipping,
  }
}
