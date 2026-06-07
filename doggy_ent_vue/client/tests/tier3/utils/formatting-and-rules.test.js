import { describe, expect, it } from 'vitest'

import {
  formatAdminCampaignPrice,
  formatCampaignDonationRule,
} from '../../../src/domains/admin/utils/adminCampaigns.utils.js'
import {
  formatPromoDiscount,
  isUnlimitedPromo,
} from '../../../src/domains/promos/utils/promo.utils.js'
import {
  normalizePromoForm,
} from '../../../src/domains/promos/utils/promo.rules.js'

describe('client formatting and rule helpers', () => {
  it('formats campaign prices and donation rules', () => {
    expect(formatAdminCampaignPrice(12.5)).toBe('$12.50')
    expect(formatCampaignDonationRule({
      donationType: 'PERCENT',
      donationValue: 10,
    })).toBe('10% of selected product sales')
  })

  it('formats promo discounts and unlimited labels', () => {
    expect(formatPromoDiscount({
      discountType: 'PERCENT',
      discountValue: 20,
    })).toBe('20% OFF')
    expect(formatPromoDiscount({
      discountType: 'FIXED',
      discountValue: 5,
    })).toBe('$5.00 OFF')
    expect(isUnlimitedPromo(null)).toBe(true)
  })

  it('normalizes unique promo rules', () => {
    const promo = normalizePromoForm({
      type: 'UNIQUE',
      status: 'active',
      assignedCustomerEmail: ' customer@example.com ',
      usageLimitTotal: '',
      usageLimitPerCustomer: '',
      referralOwnerName: 'Should clear',
    })

    expect(promo.status).toBe('ACTIVE')
    expect(promo.usageLimitTotal).toBe(1)
    expect(promo.usageLimitPerCustomer).toBe(1)
    expect(promo.referralOwnerName).toBeNull()
  })
})
