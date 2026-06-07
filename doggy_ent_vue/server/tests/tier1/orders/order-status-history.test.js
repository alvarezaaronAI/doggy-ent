import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  existingStatus: 'PAID',
  updateResult: null,
  createdHistory: [],
}))

vi.mock('../../../src/db/prisma.js', () => ({
  prisma: {
    $transaction: async (callback) => callback({
      order: {
        findUnique: vi.fn(async () => ({
          id: 'order-1',
          status: prismaMock.existingStatus,
        })),
        update: vi.fn(async ({ data }) => ({
          id: 'order-1',
          orderNumber: 'DGE-1',
          status: data.status,
          total: 40,
          subtotal: 40,
          shippingAmount: 0,
          discountAmount: 0,
          taxAmount: 0,
          campaignUsages: [],
          items: [],
          statusHistory: prismaMock.createdHistory,
        })),
      },
      orderStatusHistory: {
        create: vi.fn(async ({ data }) => {
          const entry = {
            id: 'history-1',
            createdAt: new Date('2026-06-07T00:00:00.000Z'),
            ...data,
          }

          prismaMock.createdHistory.unshift(entry)

          return entry
        }),
      },
    }),
  },
}))

const {
  updateOrderStatusById,
} = await import('../../../src/domains/orders/repositories/orders.repository.js')

describe('order status history', () => {
  beforeEach(() => {
    prismaMock.existingStatus = 'PAID'
    prismaMock.createdHistory = []
  })

  it('records a history row when status changes', async () => {
    const order = await updateOrderStatusById('order-1', 'SHIPPED', {
      note: 'Packed',
      changedByType: 'ADMIN_ENV',
      changedBy: 'ADMIN_ENV',
    })

    expect(order.status).toBe('SHIPPED')
    expect(order.statusHistory).toHaveLength(1)
    expect(order.statusHistory[0]).toMatchObject({
      orderId: 'order-1',
      fromStatus: 'PAID',
      toStatus: 'SHIPPED',
      note: 'Packed',
      changedByType: 'ADMIN_ENV',
      changedBy: 'ADMIN_ENV',
    })
    expect(order.lastStatusChange.toStatus).toBe('SHIPPED')
  })

  it('does not create history for same-status saves', async () => {
    const order = await updateOrderStatusById('order-1', 'PAID')

    expect(order.status).toBe('PAID')
    expect(order.statusHistory).toEqual([])
    expect(order.lastStatusChange).toBeNull()
  })
})
