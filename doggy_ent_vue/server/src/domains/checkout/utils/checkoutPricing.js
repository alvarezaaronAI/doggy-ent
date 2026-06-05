import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  DEFAULT_SHIPPING_METHOD,
  SHIPPING_OPTIONS,
} from '../constants/checkout.constants.js'

export function calculateSubtotal(cartItems = []) {
  return normalizeCurrencyAmount(
    cartItems.reduce((total, item) => {
      const price = Number(item.price || 0)
      const quantity = Number(item.quantity || 0)

      return total + (price * quantity)
    }, 0),
  )
}

export function calculateShipping(shipping = {}) {
  const method = String(
    shipping.method || DEFAULT_SHIPPING_METHOD,
  ).trim()

  return normalizeCurrencyAmount(
    SHIPPING_OPTIONS[method]?.price
    ?? SHIPPING_OPTIONS[DEFAULT_SHIPPING_METHOD].price,
  )
}

export function calculateCheckoutDiscountAmount(promoResult) {
  if (!promoResult?.valid) {
    return 0
  }

  return normalizeCurrencyAmount(
    promoResult.discountAmount || 0,
  )
}

export function calculateCheckoutDonationAmount(
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
