import { describe, expect, it } from 'vitest'
import {
  filterAccountOrders,
  groupAccountOrders,
} from '../../../src/domains/account/utils/orderHistory.js'
import {
  formatAccountDate,
  orderItemCount,
  safeTrackingUrl,
} from '../../../src/domains/account/utils/accountFormatting.js'
const orders = [
  {
    customerReference: 'CE-1060',
    status: 'SHIPPED',
    createdAt: '2026-10-10T12:00:00Z',
    items: [{ productName: 'Chicken Jerky', quantity: 2 }],
  },
  {
    customerReference: 'CE-1059',
    status: 'PROCESSING',
    createdAt: '2026-10-09T12:00:00Z',
    items: [],
  },
  {
    customerReference: 'CE-1058',
    status: 'DELIVERED',
    createdAt: '2026-09-20T12:00:00Z',
    items: [],
  },
]
describe('account order history', () => {
  it('searches references and products together with the status filter', () => {
    expect(filterAccountOrders(orders, ' chicken ', 'SHIPPED')).toEqual([orders[0]])
    expect(filterAccountOrders(orders, 'CE-1059', '')).toEqual([orders[1]])
    expect(filterAccountOrders(orders, 'chicken', 'DELIVERED')).toEqual([])
  })
  it('groups loaded orders by month, preserving newest-first API order', () => {
    const groups = groupAccountOrders(orders)
    expect(groups.map((group) => group.orders.length)).toEqual([2, 1])
    expect(groups[0].label).toBe('October 2026')
    expect(groups[0].orders[0]).toBe(orders[0])
  })
  it('counts quantities, handles invalid dates, and rejects unsafe tracking links', () => {
    expect(orderItemCount(orders[0])).toBe(2)
    expect(formatAccountDate('invalid')).toBe('Date unavailable')
    expect(groupAccountOrders([{ createdAt: 'invalid' }])[0].label).toBe('Date unavailable')
    expect(safeTrackingUrl('javascript:alert(1)')).toBe('')
    expect(safeTrackingUrl('https://example.com/track')).toBe('https://example.com/track')
  })
})
