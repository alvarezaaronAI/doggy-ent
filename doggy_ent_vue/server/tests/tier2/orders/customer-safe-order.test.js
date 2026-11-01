import { describe, expect, it } from 'vitest'

import {
  mapCustomerOrder,
  mapOrder,
  getOrderDonationAmount,
} from '../../../src/domains/orders/mappers/orders.mapper.js'

describe('customer-safe order lookup mapping', () => {
  it('omits internal order id and Stripe PaymentIntent id', () => {
    const order = mapCustomerOrder({
      id: 'internal-order-id',
      orderNumber: 'DGE-123',
      customerName: 'Jane Customer',
      customerEmail: 'jane@example.com',
      stripePaymentIntentId: 'pi_secret',
      status: 'PAID',
      total: 50,
      subtotal: 40,
      shippingAmount: 5,
      shippingMethod: 'shippo:rate_123',
      shippingCarrier: 'USPS',
      shippingService: 'Ground Advantage',
      shippingRateId: 'rate_123',
      shippingRateProvider: 'SHIPPO',
      discountAmount: 10,
      taxAmount: 3,
      currency: 'usd',
      items: [],
      campaignUsages: [],
      statusHistory: [],
      shipments: [
        {
          id: 'internal-shipment-id',
          carrier: 'usps',
          trackingNumber: 'TRACK123',
          trackingUrl: 'https://tracking.example/track',
          shipmentStatus: 'TRANSIT',
          events: [
            {
              id: 'internal-event-id',
              status: 'TRANSIT',
              message: 'In transit',
              location: 'Seattle, WA',
              occurredAt: new Date('2026-06-08T00:00:00.000Z'),
            },
          ],
        },
      ],
      createdAt: new Date('2026-06-07T00:00:00.000Z'),
      updatedAt: new Date('2026-06-07T00:00:00.000Z'),
    })

    expect(order.orderNumber).toBe('DGE-123')
    expect(order.discountAmount).toBe(10)
    expect(order).not.toHaveProperty('id')
    expect(order).not.toHaveProperty('stripePaymentIntentId')
    expect(order.shippingCarrier).toBe('USPS')
    expect(order.shippingService).toBe('Ground Advantage')
    expect(order.shippingRateId).toBe('rate_123')
    expect(order.shipment.trackingNumber).toBe('TRACK123')
    expect(order.shipment).not.toHaveProperty('id')
    expect(order.shipment.events[0]).not.toHaveProperty('id')
  })

  it.each([true, false])('retains frozen attribution when campaign rows are present=%s', present => {
    const raw = {
      id: 'internal', orderNumber: 'DGE-FIXTURE', status: 'PAID', stripePaymentIntentId: 'pi_fixture',
      createdAt: new Date(),
      attributionSnapshot: {
        version: 1,
        promo: { promoId: 'promo', promoCode: 'FROZEN', promoName: 'Agreed promo', customerEmail: 'fixture@example.test', discountAmount: 2, subtotalAmount: 20, usageLimitTotal: 7 },
        campaigns: [{ campaignId: 'campaign', campaignName: 'Agreed campaign', donationTarget: 'Agreed beneficiary', donationType: 'PERCENT', donationValue: 10, eligibleSubtotal: 20, donationAmount: 2, matchedProductIds: ['product'] }],
      },
      campaignUsages: present ? [{ campaignId: 'campaign', donationAmount: 99, campaign: { name: 'Changed', donationTarget: 'Changed', donationType: 'FIXED', donationValue: 99, slug: 'current-page', publicPageEnabled: true, status: 'ACTIVE' } }] : [],
      promoUsage: present ? { promo: { code: 'CHANGED', name: 'Changed' }, discountAmount: 99 } : null,
    }
    const order = mapCustomerOrder(mapOrder(raw))
    expect(order.promoUsage).toMatchObject({ promoCode: 'FROZEN', promoName: 'Agreed promo', discountAmount: 2 })
    expect(order.campaignAttributions).toEqual([expect.objectContaining({ campaignName: 'Agreed campaign', donationTarget: 'Agreed beneficiary', donationType: 'PERCENT', donationValue: 10, donationAmount: 2, pageAvailable: present })])
    expect(order.donationAmount).toBe(2); expect(getOrderDonationAmount(raw)).toBe(2)
    expect(order).not.toHaveProperty('attributionSnapshot')
    expect(order.promoUsage).not.toHaveProperty('usageLimitTotal')
    expect(order).not.toHaveProperty('stripePaymentIntentId')
  })

  it('keeps the legacy live-rule fallback when no attribution snapshot was saved', () => {
    const order = mapCustomerOrder({ campaignUsages: [{ campaignId: 'legacy', donationAmount: 3, campaign: { name: 'Legacy campaign', donationTarget: 'Legacy beneficiary' } }], promoUsage: { discountAmount: 1, promo: { code: 'LEGACY' } } })
    expect(order.donationAmount).toBe(3)
    expect(order.campaignAttributions[0].donationTarget).toBe('Legacy beneficiary')
    expect(order.promoUsage.promoCode).toBe('LEGACY')
  })
})
