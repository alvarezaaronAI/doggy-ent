import { describe, expect, it } from 'vitest'

import {
  calculateCheckoutDiscountAmount,
  calculateCheckoutDonationAmount,
  calculateShipping,
  calculateSubtotal,
} from '../../../src/domains/checkout/utils/checkoutPricing.js'

describe('checkout pricing helpers', () => {
  it('calculates subtotal from selected cart prices and quantities', () => {
    expect(calculateSubtotal([
      {
        price: 12,
        quantity: 2,
      },
      {
        price: 18.5,
        quantity: 1,
      },
    ])).toBe(42.5)
  })

  it('uses zero discount for invalid promos and real amount for valid promos', () => {
    expect(calculateCheckoutDiscountAmount({
      valid: false,
      discountAmount: 20,
    })).toBe(0)

    expect(calculateCheckoutDiscountAmount({
      valid: true,
      discountAmount: 20,
    })).toBe(20)
  })

  it('keeps promo discounts and campaign donations independent', () => {
    const discount = calculateCheckoutDiscountAmount({
      valid: true,
      discountAmount: 20,
    })

    const donation = calculateCheckoutDonationAmount([
      {
        donationAmount: 4,
      },
      {
        donationAmount: 1.5,
      },
    ])

    expect(discount).toBe(20)
    expect(donation).toBe(5.5)
  })

  it('falls back to standard shipping for unknown shipping codes', () => {
    expect(calculateShipping({
      method: 'not-real',
    })).toBe(5.99)
  })
})
