import { beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import { once } from 'node:events'
import { betterAuth } from 'better-auth'
import { memoryAdapter } from 'better-auth/adapters/memory'
const provider = vi.hoisted(() => ({ getEmailProviderStatus: vi.fn(), queueEmail: vi.fn() }))
vi.mock('../../../src/domains/emails/services/emailProvider.service.js', () => provider)
import { deliverCustomerPasswordReset, getCustomerRecoveryReadiness } from '../../../src/domains/auth/services/customerRecovery.service.js'
import router from '../../../src/domains/auth/routes/customerRecovery.routes.js'
beforeEach(() => { vi.resetAllMocks(); provider.getEmailProviderStatus.mockReturnValue({ live: true }) })
describe('customer recovery readiness and provider honesty', () => {
  it('exposes only a public delivery-availability flag', () => {
    provider.getEmailProviderStatus.mockReturnValue({ live: false, configured: true, mode: 'DRY_RUN', private: 'never-public' })
    expect(getCustomerRecoveryReadiness()).toEqual({ passwordResetAvailable: false })
  })
  it('never sends from disabled/test delivery and rejects false success states', async () => {
    provider.getEmailProviderStatus.mockReturnValue({ live: false })
    await expect(deliverCustomerPasswordReset({})).rejects.toMatchObject({ status: 'SERVICE_UNAVAILABLE' })
    expect(provider.queueEmail).not.toHaveBeenCalled()
    provider.getEmailProviderStatus.mockReturnValue({ live: true })
    for (const status of ['MOCKED', 'FAILED', 'SKIPPED', 'PENDING', 'DUPLICATE']) {
      provider.queueEmail.mockResolvedValue({ status })
      await expect(deliverCustomerPasswordReset({})).rejects.toMatchObject({ status: 'SERVICE_UNAVAILABLE' })
    }
  })
  it('accepts only provider acceptance or a previously accepted identical delivery', async () => {
    for (const result of [{ status: 'SENT' }, { status: 'DUPLICATE', delivery: { status: 'SENT' } }]) {
      provider.queueEmail.mockResolvedValue(result)
      await expect(deliverCustomerPasswordReset({})).resolves.toBeUndefined()
    }
  })
  it('blocks all reset requests identically when unavailable, before account lookup or token creation', async () => {
    provider.getEmailProviderStatus.mockReturnValue({ live: false })
    const app = express(); app.use(router); app.post('/request-password-reset', (_req, res) => res.json({ engineReached: true }))
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening')
    const base = `http://127.0.0.1:${server.address().port}`
    try {
      const readiness = await fetch(base + '/readiness')
      expect(readiness.headers.get('cache-control')).toBe('no-store')
      expect(await readiness.json()).toEqual({ passwordResetAvailable: false })
      for (const email of ['known-fixture@example.test', 'unknown-fixture@example.test']) {
        const response = await fetch(base + '/request-password-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
        expect(response.status).toBe(503); expect(await response.text()).not.toContain('engineReached')
      }
      provider.getEmailProviderStatus.mockReturnValue({ live: true })
      const available = await fetch(base + '/request-password-reset', { method: 'POST' })
      expect(await available.json()).toEqual({ engineReached: true })
    } finally { await new Promise(resolve => server.close(resolve)) }
  })
  it('actual engine keeps request acceptance identical when delivery fails or the account is absent', async () => {
    const now = new Date()
    const db = { user: [{ id: 'fixture-user', name: 'Fixture', email: 'known@example.test', emailVerified: false, createdAt: now, updatedAt: now }], account: [], verification: [], session: [] }
    const auth = betterAuth({ logger: { disabled: true }, secret: 'synthetic-memory-fixture-only-secret', baseURL: 'http://localhost:3000', trustedOrigins: ['http://localhost:5173'], database: memoryAdapter(db), emailAndPassword: { enabled: true, sendResetPassword: async () => deliverCustomerPasswordReset({ event: 'SYNTHETIC_FIXTURE' }) } })
    provider.queueEmail.mockResolvedValue({ status: 'FAILED' })
    const results = []
    for (const email of ['known@example.test', 'absent@example.test']) {
      const response = await auth.handler(new Request('http://localhost:3000/api/auth/request-password-reset', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' }, body: JSON.stringify({ email, redirectTo: 'http://localhost:5173/account/reset-password' }) }))
      results.push({ status: response.status, body: await response.json() })
    }
    expect(results[0]).toEqual(results[1]); expect(results[0].status).toBe(200)
    expect(JSON.stringify(results)).not.toContain('known@example.test')
    expect(JSON.stringify(results)).not.toContain('token')
    expect(provider.queueEmail).toHaveBeenCalledOnce()
  })
})
