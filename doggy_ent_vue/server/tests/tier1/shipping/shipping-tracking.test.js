import { describe, expect, it } from 'vitest'

import {
  mapShippoRate,
  mapShippoTrackingResponse,
} from '../../../src/domains/shipping/mappers/shipping.mapper.js'
import {
  validateTrackingPayload,
} from '../../../src/domains/shipping/validators/shipping.validator.js'

describe('shipping tracking helpers', () => {
  it('normalizes manual tracking payloads', () => {
    const payload = validateTrackingPayload({
      carrier: ' USPS ',
      trackingNumber: ' 9400 1000 0000 0000 ',
      shipmentStatus: 'transit',
    })

    expect(payload.carrier).toBe('usps')
    expect(payload.trackingNumber).toBe('9400100000000000')
    expect(payload.shipmentStatus).toBe('TRANSIT')
  })

  it('maps Shippo tracking responses to shipment fields', () => {
    const mapped = mapShippoTrackingResponse({
      carrier: 'usps',
      trackingNumber: 'TRACK123',
      data: {
        tracking_url_provider: 'https://tracking.example/TRACK123',
        eta: '2026-06-15T00:00:00.000Z',
        tracking_status: {
          status: 'DELIVERED',
          status_details: 'Delivered at mailbox',
          location: {
            city: 'Tacoma',
            state: 'WA',
          },
          status_date: '2026-06-14T12:00:00.000Z',
        },
        tracking_history: [
          {
            status: 'TRANSIT',
            status_details: 'In transit',
            location: {
              city: 'Portland',
              state: 'OR',
            },
            status_date: '2026-06-13T12:00:00.000Z',
          },
        ],
      },
    })

    expect(mapped.carrier).toBe('usps')
    expect(mapped.trackingNumber).toBe('TRACK123')
    expect(mapped.shipmentStatus).toBe('DELIVERED')
    expect(mapped.trackingUrl).toBe('https://tracking.example/TRACK123')
    expect(mapped.events[0].status).toBe('TRANSIT')
    expect(mapped.events[0].location).toBe('Portland, OR')
  })

  it('maps Shippo rates into checkout-safe shipping options', () => {
    const mapped = mapShippoRate({
      object_id: 'rate_123',
      provider: 'USPS',
      amount: '8.45',
      currency: 'USD',
      estimated_days: 3,
      servicelevel: {
        name: 'Ground Advantage',
      },
    })

    expect(mapped.code).toBe('shippo:rate_123')
    expect(mapped.rateId).toBe('rate_123')
    expect(mapped.provider).toBe('SHIPPO')
    expect(mapped.carrier).toBe('USPS')
    expect(mapped.service).toBe('Ground Advantage')
    expect(mapped.price).toBe(8.45)
    expect(mapped.description).toContain('3 business days')
  })
})
