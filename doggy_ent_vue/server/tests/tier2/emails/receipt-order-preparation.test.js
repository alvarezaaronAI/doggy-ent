import { beforeEach, describe, expect, it, vi } from 'vitest'
const repo = vi.hoisted(() => ({ createOrder: vi.fn(), findAllOrders: vi.fn(), findCustomerOrderByReference: vi.fn(), findOrderById: vi.fn(), findOrderByStripePaymentIntentId: vi.fn(), findOrderStats: vi.fn(), findOrdersByCustomerEmail: vi.fn(), updateOrderStatusById: vi.fn() }))
const receipts = vi.hoisted(() => ({ prepareCheckoutReceipt: vi.fn() }))
vi.mock('../../../src/domains/orders/repositories/orders.repository.js', () => repo)
vi.mock('../../../src/domains/emails/services/checkoutReceipt.service.js', () => receipts)
const { createNewOrder } = await import('../../../src/domains/orders/services/orders.service.js')
const input = { stripePaymentIntentId: 'pi_fixture', customerName: 'Alex', customerEmail: 'guest@example.test', subtotal: 20, total: 25, items: [{ name: 'Actual treat', price: 20, quantity: 1, size: '6 oz', sku: 'REAL-6' }] }
beforeEach(() => { vi.clearAllMocks(); repo.findOrderByStripePaymentIntentId.mockResolvedValue(null); repo.createOrder.mockResolvedValue({ id: 'order-1' }); receipts.prepareCheckoutReceipt.mockResolvedValue({ dedupeKey: 'receipt-fixture' }) })
describe('recoverable receipt preparation', () => {
  it('does not commit an order/stock without the enabled receipt intent when preparation fails', async () => {
    receipts.prepareCheckoutReceipt.mockRejectedValueOnce(new Error('Receipt storage unavailable'))
    await expect(createNewOrder(input, { verifiedCheckout: true })).rejects.toThrow('Receipt storage unavailable')
    expect(repo.createOrder).not.toHaveBeenCalled()
    expect(await createNewOrder(input, { verifiedCheckout: true })).toEqual({ id: 'order-1' })
    expect(repo.createOrder).toHaveBeenCalledOnce()
    expect(repo.createOrder).toHaveBeenCalledWith(expect.objectContaining({ stripePaymentIntentId: input.stripePaymentIntentId, receiptDelivery: { dedupeKey: 'receipt-fixture' } }))
  })
  it('never prepares receipts from a generic order call or a replay', async () => {
    await createNewOrder(input); expect(receipts.prepareCheckoutReceipt).not.toHaveBeenCalled()
    repo.findOrderByStripePaymentIntentId.mockResolvedValue({ id: 'existing' })
    expect(await createNewOrder(input, { verifiedCheckout: true })).toEqual({ id: 'existing' })
    expect(receipts.prepareCheckoutReceipt).not.toHaveBeenCalled()
  })
})
