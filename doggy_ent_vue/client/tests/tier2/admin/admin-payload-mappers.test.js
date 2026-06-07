import { describe, expect, it } from 'vitest'

import {
  buildAdminCampaignPayload,
  mapCampaignToAdminCampaignForm,
} from '../../../src/domains/admin/mappers/adminCampaignForm.mapper.js'
import {
  buildAdminPromoPayload,
  mapPromoToAdminPromoForm,
} from '../../../src/domains/admin/mappers/adminPromoForm.mapper.js'

describe('admin payload mappers', () => {
  it('normalizes promo payloads for server rules', () => {
    const payload = buildAdminPromoPayload({
      code: ' chase20 ',
      name: 'Chase 20',
      type: 'GLOBAL',
      status: 'ACTIVE',
      discountType: 'PERCENT',
      discountValue: '20',
      minimumSubtotal: '30',
      usageLimitTotal: '',
      usageLimitPerCustomer: '',
      assignedCustomerEmail: '',
      referralOwnerName: '',
      startsDate: '2026-06-07',
      startsTime: '10:30',
      endsDate: '',
      endsTime: '',
    })

    expect(payload).toMatchObject({
      code: ' chase20 ',
      discountType: 'PERCENT',
      discountValue: 20,
      minimumSubtotal: 30,
      usageLimitTotal: null,
      usageLimitPerCustomer: null,
      startsAt: '2026-06-07T10:30',
      endsAt: null,
    })
  })

  it('maps promo datetime values back to admin form fields', () => {
    const form = mapPromoToAdminPromoForm({
      code: 'CHASE20',
      name: 'Chase 20',
      discountType: 'PERCENT',
      discountValue: 20,
      minimumSubtotal: 30,
      startsAt: '2026-06-07T10:30:00.000Z',
      endsAt: null,
    })

    expect(form.startsDate).toBe('2026-06-07')
    expect(form.startsTime).toBe('10:30')
    expect(form.discountValue).toBe(20)
  })

  it('normalizes campaign payload product IDs and dates', () => {
    const payload = buildAdminCampaignPayload({
      name: 'Laika Shelter',
      description: 'Donation drive',
      donationTarget: 'Laika Shelter',
      donationType: 'PERCENT',
      donationValue: '10',
      status: 'ACTIVE',
      productIds: ['chicken', 'beef'],
      startsDate: '2026-06-07',
      startsTime: '10:30',
      endsDate: '',
      endsTime: '',
    })

    expect(payload).toMatchObject({
      name: 'Laika Shelter',
      donationType: 'PERCENT',
      donationValue: 10,
      productIds: ['chicken', 'beef'],
      startsAt: '2026-06-07T10:30',
      endsAt: null,
    })
  })

  it('maps campaign analytics fields into admin form without losing products', () => {
    const form = mapCampaignToAdminCampaignForm({
      name: 'Laika Shelter',
      description: 'Donation drive',
      donationTarget: 'Laika Shelter',
      donationType: 'PERCENT',
      donationValue: 10,
      status: 'ACTIVE',
      productIds: ['chicken', 'beef'],
      startsAt: null,
      endsAt: null,
    })

    expect(form.productIds).toEqual(['chicken', 'beef'])
    expect(form.donationValue).toBe(10)
  })
})
