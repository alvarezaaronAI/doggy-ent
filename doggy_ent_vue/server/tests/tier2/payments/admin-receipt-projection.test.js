import { describe, expect, it } from 'vitest'
import { mapOrderEmailDelivery, mapCustomerOrder } from '../../../src/domains/orders/mappers/orders.mapper.js'
import { mapEmailDelivery, mapEmailDeliveryStats } from '../../../src/domains/emails/mappers/emailDelivery.mapper.js'

const receipt = { id: 'offline-email', event: 'ORDER_CONFIRMATION', status: 'QUEUED', automatic: true, renderedEmail: { html: 'PRIVATE_FROZEN_BODY' }, metadata: { private: 'PRIVATE_METADATA' }, dedupeKey: 'PRIVATE_DEDUPE', providerId: 'PRIVATE_PROVIDER_ID' }

describe('minimal automatic receipt activity in admin projections', () => {
  it.each([mapOrderEmailDelivery, mapEmailDelivery])('includes the actual automatic flag without private send internals', mapper => {
    const result = mapper(receipt)
    expect(result).toMatchObject({ id: receipt.id, status: 'QUEUED', automatic: true })
    expect(JSON.stringify(result)).not.toMatch(/PRIVATE_/)
    for (const key of ['renderedEmail', 'metadata', 'dedupeKey', 'providerId']) expect(result).not.toHaveProperty(key)
  })

  it.each([undefined, null, false, 'true', 1])('does not manufacture automatic origin from %s', automatic => {
    for (const mapper of [mapOrderEmailDelivery, mapEmailDelivery]) expect(mapper({ ...receipt, automatic }).automatic).toBe(false)
  })

  it('retains the origin through notification statistics mapping', () => {
    expect(mapEmailDeliveryStats({ recent: [receipt] }).recent[0].automatic).toBe(true)
  })

  it('keeps private delivery details out of the customer receipt', () => {
    const customer = mapCustomerOrder({ orderNumber: 'CE-OFFLINE', status: 'PAID', items: [], emailDeliveries: [receipt] })
    expect(customer.receiptEmailStatus).toBe('QUEUED')
    expect(customer).not.toHaveProperty('emailDeliveries')
    expect(JSON.stringify(customer)).not.toMatch(/PRIVATE_|offline-email/)
  })
})
