import { describe, expect, it } from 'vitest'

import {
  calculateDiscountAmount,
  normalizePromoDiscountValue,
} from '../../../src/domains/promos/services/promos.service.js'

describe('promo discount calculations', () => {
  it('treats 20 as a 20 percent discount', () => {
    const promo = {
      discountType: 'PERCENT',
      discountValue: 20,
    }

    expect(calculateDiscountAmount(promo, 100)).toBe(20)
  })

  it('treats legacy fractional percent values as percentages', () => {
    const promo = {
      discountType: 'PERCENT',
      discountValue: 0.2,
    }

    expect(normalizePromoDiscountValue(promo)).toBe(20)
    expect(calculateDiscountAmount(promo, 100)).toBe(20)
  })

  it('caps percent discounts at the subtotal', () => {
    const promo = {
      discountType: 'PERCENT',
      discountValue: 200,
    }

    expect(calculateDiscountAmount(promo, 25)).toBe(25)
  })

  it('treats fixed discounts as dollars and caps at subtotal', () => {
    expect(calculateDiscountAmount({
      discountType: 'FIXED',
      discountValue: 5,
    }, 20)).toBe(5)

    expect(calculateDiscountAmount({
      discountType: 'FIXED',
      discountValue: 50,
    }, 20)).toBe(20)
  })
})
