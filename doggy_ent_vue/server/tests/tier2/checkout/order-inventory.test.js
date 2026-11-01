import { beforeEach, describe, expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({ $transaction: vi.fn() }))
const tx = vi.hoisted(() => ({ productVariant: { findUnique: vi.fn(), updateMany: vi.fn() }, order: { create: vi.fn() } }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
const { createOrder, createOrderTx } = await import('../../../src/domains/orders/repositories/orders.repository.js')
const input = { orderNumber: 'CE-TEST', customerName: 'Test Customer', customerEmail: 'test@example.com', status: 'PAID', stripePaymentIntentId: 'pi_test', items: [{ productId: 'p', productName: 'Treat', sku: 'REAL-6', size: '6 oz', quantity: 2, unitPrice: 14.99, lineTotal: 29.98 }] }
const variant = { id: 'v', productId: 'p', sku: 'REAL-6', size: '6 oz', isActive: true, product: { status: 'ACTIVE', sellingMode: 'INVENTORY_LIMITED', isTestProduct: false } }
beforeEach(() => {
  vi.clearAllMocks()
  db.$transaction.mockImplementation(action => action(tx))
  tx.productVariant.findUnique.mockResolvedValue(variant)
  tx.productVariant.updateMany.mockResolvedValue({ count: 1 })
  tx.order.create.mockResolvedValue({ ...input, id: 'o', createdAt: new Date(), updatedAt: new Date() })
})
describe('order and inventory transaction boundary', () => {
  it('conditionally decrements real stock inside the same transaction as order insertion', async () => {
    await createOrder(input)
    expect(db.$transaction).toHaveBeenCalledOnce()
    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({ where: { id: 'v', productId: 'p', sku: 'REAL-6', isActive: true, inventory: { gte: 2 } }, data: { inventory: { decrement: 2 } } })
    expect(tx.order.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PAID', stripePaymentIntentId: 'pi_test' }) }))
  })
  it('does not create an order when the atomic stock guard fails', async () => {
    tx.productVariant.updateMany.mockResolvedValue({ count: 0 })
    await expect(createOrder(input)).rejects.toMatchObject({ statusCode: 409 })
    expect(tx.order.create).not.toHaveBeenCalled()
  })
  it('never decrements made-to-order inventory', async () => {
    tx.productVariant.findUnique.mockResolvedValue({ ...variant, product: { ...variant.product, sellingMode: 'MADE_TO_ORDER' } })
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
  it('exports a transaction-only helper and aggregates repeated variants before one deduction', async () => {
    await createOrderTx(tx, { ...input, items: [{ ...input.items[0], variantId: 'v' }, { ...input.items[0], variantId: 'v', quantity: 3 }] })
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(tx.productVariant.findUnique).toHaveBeenCalledExactlyOnceWith({ where: { id: 'v' }, include: { product: true } })
    expect(tx.productVariant.updateMany).toHaveBeenCalledExactlyOnceWith({ where: { id: 'v', productId: 'p', sku: 'REAL-6', isActive: true, inventory: { gte: 5 } }, data: { inventory: { decrement: 5 } } })
    expect(tx.order.create.mock.calls[0][0].data.items.create).toHaveLength(2)
  })
  it.each([{ productId: 'other' }, { sku: 'other' }, { size: '18 oz' }, { isActive: false }, { product: { ...variant.product, isTestProduct: true } }, { product: { ...variant.product, status: 'ARCHIVED' } }])('rejects an unavailable or mismatched frozen variant %j', async change => {
    tx.productVariant.findUnique.mockResolvedValue({ ...variant, ...change })
    await expect(createOrderTx(tx, { ...input, items: [{ ...input.items[0], variantId: 'v' }] })).rejects.toMatchObject({ code: 'CHECKOUT_VARIANT_UNAVAILABLE' })
    expect(tx.productVariant.updateMany).not.toHaveBeenCalled()
    expect(tx.order.create).not.toHaveBeenCalled()
  })
  it('rejects conflicting repeated identities before taking stock', async () => {
    await expect(createOrderTx(tx, { ...input, items: [{ ...input.items[0], variantId: 'v' }, { ...input.items[0], variantId: 'other' }] })).rejects.toMatchObject({ code: 'CHECKOUT_VARIANT_UNAVAILABLE' })
    expect(tx.productVariant.findUnique).not.toHaveBeenCalled()
  })
})
