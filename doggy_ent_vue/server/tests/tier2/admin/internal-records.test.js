import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  mapAdminOrderRecord,
  ORDER_RECORD_FIELDS,
} from '../../../src/domains/orders/mappers/adminOrderRecord.mapper.js'
import {
  mapAdminCustomerRecord,
  CUSTOMER_RECORD_FIELDS,
} from '../../../src/domains/customers/mappers/adminCustomerRecord.mapper.js'
import { mapAdminCustomerDetail } from '../../../src/domains/customers/mappers/adminCustomers.mapper.js'
import { mapCustomerOrder } from '../../../src/domains/orders/mappers/orders.mapper.js'

const queries = vi.hoisted(() => ({ order: vi.fn(), promo: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({
  prisma: {
    order: { findUnique: queries.order },
    promoUsage: { findFirst: queries.promo },
  },
}))
const { findOrderById } =
  await import('../../../src/domains/orders/repositories/orders.repository.js')

beforeEach(() => vi.resetAllMocks())
const canary = 'PRIVATE_FIXTURE_MUST_NOT_APPEAR'
const scalarFields = (model) =>
  Prisma.dmmf.datamodel.models
    .find((item) => item.name === model)
    .fields.filter((field) => field.kind !== 'object')
    .map((field) => field.name)
    .sort()

describe('admin record inspection safety', () => {
  it('accounts for every Order and User scalar column in the current Prisma schema', () => {
    expect([...ORDER_RECORD_FIELDS].sort()).toEqual(scalarFields('Order'))
    expect([...CUSTOMER_RECORD_FIELDS].sort()).toEqual(scalarFields('User'))
  })
  it('includes operational order fields, timestamps, foreign IDs and safe relations only', () => {
    const mapped = mapAdminOrderRecord({
      id: 'order-1',
      userId: 'user-1',
      currency: 'usd',
      total: 40,
      stripePaymentIntentId: 'pi_fixture123',
      futureSecret: canary,
      items: [{ id: 'item-1', orderId: 'order-1', createdAt: '2026-10-09' }],
      shipments: [
        {
          id: 'shipment-1',
          orderId: 'order-1',
          rawStatus: { token: canary },
          events: [{ shipmentId: 'shipment-1', rawEvent: { secret: canary } }],
        },
      ],
      emailDeliveries: [
        {
          providerId: 'provider-1',
          dedupeKey: canary,
          metadata: { actionUrl: canary },
        },
      ],
      supportRequests: [
        { caseNumber: 'OI-1', orderId: 'order-1', status: 'OPEN' },
      ],
    })
    expect(mapped.order.stripePaymentIntentId).toBe('pi_fixture123')
    expect(mapped.order.userId).toBe('user-1')
    expect(mapped.items[0].createdAt).toBe('2026-10-09')
    expect(mapped.shipments[0].events[0].shipmentId).toBe('shipment-1')
    expect(mapped.emailDeliveries[0].providerId).toBe('provider-1')
    expect(mapped.supportRequests[0].caseNumber).toBe('OI-1')
    expect(JSON.stringify(mapped)).not.toContain(canary)
    expect(mapAdminOrderRecord(null)).toBeNull()
  })
  it('omits authentication records and unstructured metadata from customer detail', () => {
    const user = {
      id: 'user-1',
      name: 'Same Name',
      email: 'unique@example.com',
      password: canary,
      sessions: [{ token: canary }],
      accounts: [{ password: canary, accessToken: canary }],
      verification: { value: canary },
      profile: {
        phone: '5550100',
        defaultAddress: { city: 'Sample City', token: canary },
      },
      events: [
        { id: 'event-1', type: 'ACCOUNT_ACTIVE', metadata: { token: canary } },
      ],
      loyaltyLedger: [
        { points: 0, balanceAfter: 0, metadata: { secret: canary } },
      ],
      emailDeliveries: [
        {
          providerId: 'provider-1',
          metadata: { actionUrl: canary },
          dedupeKey: canary,
        },
      ],
    }
    const detail = mapAdminCustomerDetail(user)
    expect(detail.internalRecord.profile.defaultAddress.city).toBe(
      'Sample City',
    )
    expect(detail.internalRecord.emailDeliveries[0].providerId).toBe(
      'provider-1',
    )
    expect(detail.events[0].type).toBe('ACCOUNT_ACTIVE')
    expect(detail.internalRecord.loyaltyLedger[0].points).toBe(0)
    expect(JSON.stringify(detail)).not.toContain(canary)
    expect(mapAdminCustomerRecord(null)).toBeNull()
  })
  it('opts into internal order records only for the protected admin read', async () => {
    queries.order.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'CE-1',
      stripePaymentIntentId: 'pi_fixture123',
      status: 'PAID',
    })
    queries.promo.mockResolvedValue(null)
    const normal = await findOrderById('order-1')
    expect(normal).not.toHaveProperty('internalRecord')
    expect(queries.order.mock.calls[0][0].include).not.toHaveProperty(
      'supportRequests',
    )
    const admin = await findOrderById('order-1', { includeAdminRecord: true })
    expect(admin.internalRecord.order.id).toBe('order-1')
    expect(queries.order.mock.calls[1][0].include).toHaveProperty(
      'supportRequests',
    )
    const customer = mapCustomerOrder(admin)
    expect(customer).not.toHaveProperty('internalRecord')
    expect(customer).not.toHaveProperty('stripePaymentIntentId')
  })
})
