import { describe, expect, it } from 'vitest'

import {
  calculateDiscount,
  calculateItemCount,
  calculateOrderTotal,
  calculateSubtotal,
  calculateTax,
  calculateTaxableTotal,
} from '../../../src/domains/checkout/utils/checkout.utils.js'

describe('client checkout total helpers', () => {
  it('calculates subtotal and item count from cart items', () => {
    const items = [
      {
        price: 12,
        quantity: 2,
      },
      {
        price: 18,
        quantity: 1,
      },
    ]

    expect(calculateSubtotal(items)).toBe(42)
    expect(calculateItemCount(items)).toBe(3)
  })

  it('keeps discount, tax, and order total math consistent', () => {
    const subtotal = 100
    const discount = calculateDiscount({
      subtotal,
      discountAmount: 20,
    })
    const taxableTotal = calculateTaxableTotal({
      subtotal,
      discount,
      shipping: 5.99,
    })
    const tax = calculateTax({
      taxableTotal,
      taxRate: 0.075,
    })
    const total = calculateOrderTotal({
      taxableTotal,
      tax,
    })

    expect(discount).toBe(20)
    expect(taxableTotal).toBe(85.99)
    expect(tax).toBe(6.45)
    expect(total).toBe(92.44)
  })
})
