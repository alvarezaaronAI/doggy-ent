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
      createdAt: new Date('2026-06-07T00:00:00.000Z'),
      updatedAt: new Date('2026-06-07T00:00:00.000Z'),
    })

    expect(order.orderNumber).toBe('DGE-123')
    expect(order.discountAmount).toBe(10)
    expect(order).not.toHaveProperty('id')
    expect(order).not.toHaveProperty('stripePaymentIntentId')
  })
})
