import { describe, expect, it } from 'vitest'
import {
  getIssueEligibility,
} from '../../../src/domains/support/services/support.service.js'
import {
  mapOrderIssue,
} from '../../../src/domains/support/mappers/support.mapper.js'

describe('order issue eligibility', () => {
  it('allows delivered order issues within seven calendar days', () => {
    const eligibility = getIssueEligibility(
      {
        status: 'DELIVERED',
        updatedAt: new Date('2026-06-10T12:00:00.000Z'),
        shipments: [
          {
            deliveredAt: new Date('2026-06-10T12:00:00.000Z'),
          },
        ],
      },
      new Date('2026-06-17T11:59:00.000Z'),
    )

    expect(eligibility.eligible).toBe(true)
    expect(eligibility.categories).toContain('DAMAGED_ITEM')
  })

  it('rejects delivered order issues after seven calendar days', () => {
    const eligibility = getIssueEligibility(
      {
        status: 'DELIVERED',
        updatedAt: new Date('2026-06-10T12:00:00.000Z'),
        shipments: [
          {
            deliveredAt: new Date('2026-06-10T12:00:00.000Z'),
          },
        ],
      },
      new Date('2026-06-18T12:01:00.000Z'),
    )

    expect(eligibility.eligible).toBe(false)
    expect(eligibility.categories).toEqual([])
  })

  it('limits pre-delivery categories when delivery is not confirmed', () => {
    const eligibility = getIssueEligibility(
      {
        status: 'SHIPPED',
        updatedAt: new Date('2026-06-10T12:00:00.000Z'),
        shipments: [],
      },
      new Date('2026-06-12T12:00:00.000Z'),
    )

    expect(eligibility.eligible).toBe(true)
    expect(eligibility.categories).toContain('TRACKING_CONCERN')
    expect(eligibility.categories).not.toContain('DAMAGED_ITEM')
  })
})

describe('order issue visibility mapping', () => {
  it('hides internal notes from customer issue responses', () => {
    const issue = mapOrderIssue({
      caseNumber: 'CE-1234-ABCD',
      orderReference: 'DGE-1',
      category: 'OTHER',
      priority: 'NORMAL',
      status: 'OPEN',
      subject: 'Help',
      message: 'Customer message',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: 'customer-message',
          authorType: 'CUSTOMER',
          body: 'Visible',
          visibility: 'CUSTOMER',
          createdAt: new Date(),
        },
        {
          id: 'internal-message',
          authorType: 'ADMIN_ENV',
          body: 'Internal only',
          visibility: 'INTERNAL',
          createdAt: new Date(),
        },
      ],
      events: [],
    })

    expect(issue.messages).toHaveLength(1)
    expect(issue.messages[0].body).toBe('Visible')
  })
})
