import { describe, expect, it } from 'vitest'

import {
  mapCampaign,
} from '../../../src/domains/campaigns/mappers/campaigns.mapper.js'
import {
  mapPromoAnalytics,
} from '../../../src/domains/promos/mappers/promos.mapper.js'

describe('admin analytics mappers', () => {
  it('maps campaign order attribution rows for analytics UI', () => {
    const campaign = mapCampaign({
      id: 'campaign-1',
      name: 'LAIKA SHELTER',
      donationGenerated: 7,
      revenueGenerated: 70,
      orderCount: 2,
      productIds: ['chicken'],
      orderUsages: [
        {
          id: 'usage-1',
          orderId: 'order-1',
          eligibleSubtotal: 40,
          donationAmount: 4,
          matchedProductIds: ['chicken'],
          createdAt: new Date('2026-06-07T00:00:00.000Z'),
          order: {
            orderNumber: 'DGE-1',
            customerName: 'Jane Customer',
            customerEmail: 'jane@example.com',
            total: 55,
            status: 'PAID',
          },
        },
      ],
    })

    expect(campaign.orderAttributions).toHaveLength(1)
    expect(campaign.orderAttributions[0]).toMatchObject({
      orderNumber: 'DGE-1',
      customerEmail: 'jane@example.com',
      eligibleSubtotal: 40,
      donationAmount: 4,
      orderTotal: 55,
    })
  })

  it('maps promo analytics discount totals from PromoUsage discountAmount', () => {
    const analytics = mapPromoAnalytics({
      promo: {
        code: 'CHASE20',
      },
      usageSummary: {
        _count: {
          id: 2,
        },
        _sum: {
          subtotalAmount: 200,
          discountAmount: 40,
        },
        _avg: {
          subtotalAmount: 100,
        },
      },
      usageHistory: [
        {
          id: 'usage-1',
          orderId: 'order-1',
          customerEmail: 'jane@example.com',
          subtotalAmount: 100,
          discountAmount: 20,
          redeemedAt: new Date('2026-06-07T00:00:00.000Z'),
        },
      ],
    })

    expect(analytics.summary.totalDiscountGiven).toBe(40)
    expect(analytics.usages[0].discountAmount).toBe(20)
  })
})
