import { mapPublicTaxDetails } from '../../../shared/utils/taxSnapshot.js'

export function buildCheckoutResponse({
  subtotal,
  shippingAmount,
  discountAmount,
  donationAmount,
  tax,
  taxSnapshot = null,
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
      taxDetails: mapPublicTaxDetails(taxSnapshot, tax),
      total,
    },

    promo: promoResult,

    campaigns: campaignPreview,
    shipping,
  }
}
