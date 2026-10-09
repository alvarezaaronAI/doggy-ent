import { afterEach, describe, expect, it, vi } from 'vitest'
import express from 'express'

vi.mock('../../../src/domains/auth/services/auth.service.js', () => ({
  getSessionCookieName: () => 'admin-session',
  getAdminFromSession: async (id) =>
    id === 'fixture-admin' ? { email: 'admin@example.com' } : null,
}))
vi.mock('../../../src/domains/orders/controllers/orders.controller.js', () => {
  const read = (req, res) =>
    res.json({ internalRecord: { order: { id: req.params.orderId } } })
  return {
    getAdminOrderById: read,
    getAdminOrders: read,
    getAdminOrderStats: read,
    patchAdminOrderStatus: read,
    postAdminOrderEmailResend: read,
  }
})
vi.mock(
  '../../../src/domains/customers/controllers/adminCustomers.controller.js',
  () => {
    const read = (req, res) =>
      res.json({ internalRecord: { user: { id: req.params.customerId } } })
    return {
      getAdminCustomerController: read,
      getAdminCustomersController: read,
      deactivateAdminCustomerController: read,
      reactivateAdminCustomerController: read,
      queueCustomerVerificationController: read,
      queueCustomerPasswordResetController: read,
    }
  },
)
const { default: orders } =
  await import('../../../src/domains/orders/routes/orders.routes.js')
const { default: customers } =
  await import('../../../src/domains/customers/routes/adminCustomers.routes.js')
let server
afterEach(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
})

async function start(cookie) {
  const app = express()
  app.use((req, res, next) => {
    req.cookies = cookie ? { 'admin-session': cookie } : {}
    next()
  })
  app.use('/orders', orders)
  app.use('/customers', customers)
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  return `http://127.0.0.1:${server.address().port}`
}

describe('internal admin record route authorization', () => {
  it('rejects customer sessions before internal-record controllers run', async () => {
    const origin = await start('fixture-customer')
    for (const route of ['/orders/order-1', '/customers/user-1']) {
      const response = await fetch(origin + route)
      expect(response.status).toBe(401)
      expect(await response.json()).not.toHaveProperty('internalRecord')
    }
  })
  it('allows a valid admin session through the existing server middleware', async () => {
    const origin = await start('fixture-admin')
    expect((await fetch(origin + '/orders/order-1')).status).toBe(200)
    expect((await fetch(origin + '/customers/user-1')).status).toBe(200)
  })
})
