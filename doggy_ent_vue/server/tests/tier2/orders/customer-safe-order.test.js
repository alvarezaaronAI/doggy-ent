import { describe, expect, it } from 'vitest'

import {
  mapCustomerOrder,
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
    expect(order.shipment.trackingNumber).toBe('TRACK123')
    expect(order.shipment).not.toHaveProperty('id')
    expect(order.shipment.events[0]).not.toHaveProperty('id')
  })
})
