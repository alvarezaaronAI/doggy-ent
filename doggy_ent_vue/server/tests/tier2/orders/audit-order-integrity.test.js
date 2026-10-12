import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({ $transaction: vi.fn(), order: { findFirst: vi.fn(), findMany: vi.fn() }, promoUsage: { findFirst: vi.fn() }, user: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() } }))
const tx = vi.hoisted(() => ({ order: { findUnique: vi.fn(), update: vi.fn() }, orderStatusHistory: { create: vi.fn() } }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
const authApi = vi.hoisted(() => ({ sendVerificationEmail: vi.fn(), requestPasswordReset: vi.fn() }))
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => ({ customerAuth: { api: authApi } }))
const { updateOrderStatusById } = await import('../../../src/domains/orders/repositories/orders.repository.js')
const { findCustomerOrderForAccount, findCustomerOrdersForAccount } = await import('../../../src/domains/account/repositories/account.repository.js')
const { findAdminCustomerById, updateCustomerAccountStatus } = await import('../../../src/domains/customers/repositories/adminCustomers.repository.js')
const { queueAdminCustomerVerification, queueAdminCustomerPasswordReset } = await import('../../../src/domains/customers/services/adminCustomers.service.js')
afterEach(() => vi.unstubAllEnvs())
beforeEach(() => {
  vi.resetAllMocks(); db.$transaction.mockImplementation(callback => callback(tx))
  tx.order.findUnique.mockResolvedValue({ id: 'order', status: 'PAID' })
  tx.order.update.mockResolvedValue({ id: 'order', status: 'PROCESSING' })
})
describe('order ownership and concurrent status protection', () => {
  it('returns admin-triggered security email links to the frontend rather than the backend', async () => {
    vi.stubEnv('FRONTEND_URL', 'https://store.example.test, http://localhost:5173')
    db.user.findFirst.mockResolvedValue({ id: 'customer', email: 'fixture@example.test', role: 'CUSTOMER' })
    await queueAdminCustomerVerification('customer'); await queueAdminCustomerPasswordReset('customer')
    expect(authApi.sendVerificationEmail.mock.calls[0][0].body.callbackURL).toBe('https://store.example.test/account/profile')
    expect(authApi.requestPasswordReset.mock.calls[0][0].body.redirectTo).toBe('https://store.example.test/account/reset-password')
  })
  it('binds every account order query to the authenticated owner; guest matches require verified email', async () => {
    await findCustomerOrderForAccount({ userId: 'owner', email: ' Other@example.test ', reference: 'CE-1' })
    expect(db.order.findFirst.mock.calls[0][0].where.AND[1].OR).toEqual([{ userId: 'owner' }])
    await findCustomerOrdersForAccount({ userId: 'owner', email: ' Other@example.test ', includeVerifiedEmailMatches: true })
    expect(db.order.findMany.mock.calls[0][0].where.OR).toEqual([{ userId: 'owner' }, { userId: null, customerEmail: 'other@example.test' }])
  })
  it('does not allow customer lifecycle tools to change an ADMIN account', async () => {
    await findAdminCustomerById('candidate')
    expect(db.user.findFirst.mock.calls[0][0].where).toEqual({ id: 'candidate', role: 'CUSTOMER' })
    await updateCustomerAccountStatus({ customerId: 'candidate', status: 'DEACTIVATED', actor: { id: 'admin' } })
    expect(db.user.update.mock.calls[0][0].where).toEqual({ id: 'candidate', role: 'CUSTOMER' })
    expect(db.user.update.mock.calls[0][0].data.events.create).toMatchObject({ changedByType: 'ADMIN', changedBy: 'admin' })
  })
  it('atomically compares the current status and records the authenticated actor', async () => {
    await updateOrderStatusById('order', 'PROCESSING', { changedByType: 'ADMIN', changedBy: 'admin' })
    expect(tx.order.update.mock.calls[0][0].where).toEqual({ id: 'order', status: 'PAID' })
    expect(tx.orderStatusHistory.create.mock.calls[0][0].data).toMatchObject({ fromStatus: 'PAID', toStatus: 'PROCESSING', changedBy: 'admin' })
    tx.order.update.mockRejectedValue({ code: 'P2025' })
    await expect(updateOrderStatusById('order', 'PROCESSING')).rejects.toMatchObject({ statusCode: 409 })
  })
  it('does not let tracking regress a terminal/refunded/cancelled order', async () => {
    for (const status of ['DELIVERED', 'REFUNDED', 'CANCELLED', 'PENDING']) {
      tx.order.findUnique.mockResolvedValue({ id: 'order', status })
      await updateOrderStatusById('order', 'SHIPPED', { allowedFromStatuses: ['PAID', 'PROCESSING'] })
    }
    expect(tx.order.update).not.toHaveBeenCalled(); expect(tx.orderStatusHistory.create).not.toHaveBeenCalled()
  })
})
