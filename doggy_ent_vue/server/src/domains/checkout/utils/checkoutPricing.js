import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'

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
  return normalizeCurrencyAmount(
    shipping.price || 0,
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
