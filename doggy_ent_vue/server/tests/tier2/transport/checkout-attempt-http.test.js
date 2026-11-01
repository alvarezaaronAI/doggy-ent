import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import { once } from 'node:events'
const service = vi.hoisted(() => ({ prepare: vi.fn(), status: vi.fn() }))
const auth = vi.hoisted(() => ({ getCustomerUserFromRequest: vi.fn() }))
vi.mock('../../../src/domains/checkout/services/checkoutAttempt.service.js', () => ({ checkoutAttempts: service }))
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => auth)
import { prepareCheckoutAttempt, getCheckoutAttempt, cancelCheckoutAttempt } from '../../../src/domains/checkout/controllers/checkoutAttempt.controller.js'
let server, origin
beforeAll(async () => {
  const app = express()
  app.use(express.json())
  app.get('/attempts/:id', getCheckoutAttempt)
  app.post('/attempts/:id/finalize', getCheckoutAttempt)
  app.post('/attempts/:id/cancel', cancelCheckoutAttempt)
  app.post('/prepare', prepareCheckoutAttempt)
  server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  origin = `http://127.0.0.1:${server.address().port}`
})
afterAll(async () => { if (server) await new Promise(resolve => server.close(resolve)) })
beforeEach(() => {
  vi.resetAllMocks()
  auth.getCustomerUserFromRequest.mockResolvedValue({ id: 'session-owned-user' })
  service.status.mockImplementation(async (id, proof) => {
    if (proof !== 'fixture-proof') throw Object.assign(new Error('This checkout could not be opened.'), { statusCode: 404 })
    return { attempt: { id, status: 'PROCESSING', allowedActions: [] } }
  })
})
describe('loopback recovery controller transport (no real storage/provider)', () => {
  it('accepts only the recovery header, never query/body/PI identity substitutes', async () => {
    for (const path of ['/attempts/fixture?recoveryToken=fixture-proof', '/attempts/fixture']) {
      const response = await fetch(origin + path)
      expect(response.status).toBe(404)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toMatchObject({ success: false, message: 'This checkout could not be opened.' })
    }
    expect(service.prepare).not.toHaveBeenCalled()
  })
  it('routes status/finalize to read/reconcile, and cancel only to its explicit option', async () => {
    for (const [suffix, method] of [['', 'GET'], ['/finalize', 'POST'], ['/cancel', 'POST']]) {
      const response = await fetch(origin + '/attempts/fixture' + suffix, { method, headers: { 'X-Checkout-Recovery': 'fixture-proof' } })
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({ success: true, result: { attempt: { id: 'fixture', status: 'PROCESSING', allowedActions: [] } } })
    }
    expect(service.status.mock.calls).toEqual([['fixture', 'fixture-proof'], ['fixture', 'fixture-proof'], ['fixture', 'fixture-proof', { cancel: true }]])
    expect(service.prepare).not.toHaveBeenCalled()
  })
  it('redacts raw provider/database failures rather than exposing private diagnostics', async () => {
    service.status.mockRejectedValue(Object.assign(new Error('PRIVATE_PROVIDER_DETAIL'), { name: 'StripeInvalidRequestError', statusCode: 400, code: 'private-code' }))
    const response = await fetch(origin + '/attempts/fixture', { headers: { 'X-Checkout-Recovery': 'fixture-proof' } })
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toMatch(/PRIVATE_PROVIDER_DETAIL|private-code/)
  })
  it('binds preparation ownership to the current session, not a request-body user', async () => {
    service.prepare.mockResolvedValue({ result: { attempt: { id: 'fixture', status: 'PREPARED' } } })
    const body = { userId: 'forged-user', attemptId: 'fixture' }
    const response = await fetch(origin + '/prepare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    expect(response.status).toBe(200)
    expect(service.prepare).toHaveBeenCalledWith(body, { userId: 'session-owned-user' })
  })
})
