import { describe, expect, it } from 'vitest'

import {
  calculateDonationAmount,
} from '../../../src/domains/campaigns/utils/campaigns.utils.js'
import {
  mapCampaignDonationPreview,
} from '../../../src/domains/campaigns/mappers/campaigns.mapper.js'

describe('campaign donation calculations', () => {
  it('calculates percent donations from matched subtotal', () => {
    expect(calculateDonationAmount({
      donationType: 'PERCENT',
      donationValue: 10,
    }, 50)).toBe(5)
  })

  it('calculates fixed campaign donations', () => {
    expect(calculateDonationAmount({
      donationType: 'FIXED',
      donationValue: 3,
    }, 50)).toBe(3)
  })

  it('only includes campaign-linked products in donation preview', () => {
    const preview = mapCampaignDonationPreview({
      campaign: {
        id: 'campaign-1',
        name: 'LAIKA SHELTER',
        donationTarget: 'Laika Shelter',
        donationType: 'PERCENT',
        donationValue: 10,
        productIds: ['chicken', 'beef'],
      },
      cartItems: [
        {
          id: 'chicken',
          price: 20,
          quantity: 2,
        },
        {
          id: 'unmatched',
          price: 100,
          quantity: 1,
        },
      ],
    })

    expect(preview.matchedSubtotal).toBe(40)
    expect(preview.donationAmount).toBe(4)
    expect(preview.matchedProductIds).toEqual(['chicken'])
  })
})
