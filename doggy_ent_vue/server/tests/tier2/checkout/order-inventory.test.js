import { beforeEach, describe, expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({ $transaction: vi.fn() }))
const tx = vi.hoisted(() => ({ productVariant: { findUnique: vi.fn(), updateMany: vi.fn() }, order: { create: vi.fn() } }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
const { createOrder } = await import('../../../src/domains/orders/repositories/orders.repository.js')
const input = { orderNumber: 'CE-TEST', customerName: 'Test Customer', customerEmail: 'test@example.com', status: 'PAID', stripePaymentIntentId: 'pi_test', items: [{ productId: 'p', productName: 'Treat', sku: 'REAL-6', size: '6 oz', quantity: 2, unitPrice: 14.99, lineTotal: 29.98 }] }
beforeEach(() => {
  vi.clearAllMocks()
  db.$transaction.mockImplementation(action => action(tx))
  tx.productVariant.findUnique.mockResolvedValue({ isActive: true, product: { status: 'ACTIVE', sellingMode: 'INVENTORY_LIMITED' } })
  tx.productVariant.updateMany.mockResolvedValue({ count: 1 })
  tx.order.create.mockResolvedValue({ ...input, id: 'o', createdAt: new Date(), updatedAt: new Date() })
})
describe('order and inventory transaction boundary', () => {
  it('conditionally decrements real stock inside the same transaction as order insertion', async () => {
    await createOrder(input)
    expect(db.$transaction).toHaveBeenCalledOnce()
    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({ where: { sku: 'REAL-6', inventory: { gte: 2 } }, data: { inventory: { decrement: 2 } } })
    expect(tx.order.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PAID', stripePaymentIntentId: 'pi_test' }) }))
  })
  it('does not create an order when the atomic stock guard fails', async () => {
    tx.productVariant.updateMany.mockResolvedValue({ count: 0 })
    await expect(createOrder(input)).rejects.toMatchObject({ statusCode: 409 })
    expect(tx.order.create).not.toHaveBeenCalled()
  })
  it('never decrements made-to-order inventory', async () => {
    tx.productVariant.findUnique.mockResolvedValue({ isActive: true, product: { status: 'ACTIVE', sellingMode: 'MADE_TO_ORDER' } })
    await createOrder(input)
    expect(tx.productVariant.updateMany).not.toHaveBeenCalled(); expect(tx.order.create).toHaveBeenCalledOnce()
  })
  it('propagates unique payment insertion errors through the transaction for rollback', async () => {
    tx.order.create.mockRejectedValue({ code: 'P2002' })
    await expect(createOrder(input)).rejects.toMatchObject({ code: 'P2002' })
    expect(db.$transaction).toHaveBeenCalledOnce()
  })
  it('inserts the reserved receipt in the same paid-order transaction, never in a separate write', async () => {
    const receiptDelivery = { event: 'ORDER_CONFIRMATION', automatic: true, status: 'QUEUED', dedupeKey: 'fixture-receipt' }
    await createOrder({ ...input, receiptDelivery })
    expect(db.$transaction).toHaveBeenCalledOnce()
    expect(tx.order.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ emailDeliveries: { create: receiptDelivery } }) }))
  })
})
