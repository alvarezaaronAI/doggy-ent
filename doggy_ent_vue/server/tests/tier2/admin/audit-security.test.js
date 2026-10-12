import { afterEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import { apiError } from '../../../src/shared/utils/apiError.js'
import { assertLocalCatalogReset } from '../../../src/shared/utils/databaseSafety.js'
import { getAdminDataTarget, getAuthSecret, getAuthBaseURL, getTrustedAuthOrigins, validateDatabaseTarget } from '../../../src/config/env.js'
import { validateAccountProfile } from '../../../src/domains/account/validators/account.validator.js'
import { mapOrderIssue } from '../../../src/domains/support/mappers/support.mapper.js'
import { validateTrackingPayload } from '../../../src/domains/shipping/validators/shipping.validator.js'
import { boundedAuthHandler } from '../../../src/app/middleware/auth/boundedAuthHandler.js'
import { postShippoWebhook } from '../../../src/domains/shipping/controllers/shipping.controller.js'
import { mapCustomerOrder } from '../../../src/domains/orders/mappers/orders.mapper.js'
import { buildAccountVerificationEmail, buildPasswordResetEmail } from '../../../src/domains/emails/mappers/emailPayloads.mapper.js'

let server
afterEach(async () => {
  vi.unstubAllEnvs()
  if (server) { await new Promise(resolve => server.close(resolve)); server = null }
})
const response = () => {
  const res = { statusCode: 200, status: code => { res.statusCode = code; return res }, json: body => { res.body = body; return res } }
  return res
}
describe('production audit safeguards', () => {
  it('deduplicates identical security actions but permits a new verification/reset link without storing raw proof in the key', () => {
    const input = { user: { id: 'fixture', email: 'fixture@example.test' }, url: 'https://example.test/verify?token=fixture-one' }
    for (const build of [buildAccountVerificationEmail, buildPasswordResetEmail]) {
      const original = build(input).dedupeKey
      expect(build(input).dedupeKey).toBe(original)
      expect(build({ ...input, url: 'https://example.test/verify?token=fixture-two' }).dedupeKey).not.toBe(original)
      expect(original).not.toContain('fixture-one'); expect(original).not.toContain('https://')
    }
  })
  it('hides raw database/provider failures but retains explicit business validation', () => {
    expect(apiError(new Error('database credentials and query'), 'Try again.').message).toBe('Try again.')
    expect(apiError({ name: 'StripeInvalidRequestError', statusCode: 400, message: 'private provider data' }, 'Payment unavailable.')).toEqual({ statusCode: 500, message: 'Payment unavailable.' })
    expect(apiError({ statusCode: 409, message: 'Reload before saving.' }, 'Failed')).toEqual({ statusCode: 409, message: 'Reload before saving.' })
  })
  it('requires deliberate local reseeding and refuses remote/production/unconfirmed targets', () => {
    const input = { databaseUrl: 'postgresql://localhost/audit', nodeEnv: 'development', dataTarget: 'LOCAL', confirmed: true }
    expect(() => assertLocalCatalogReset(input)).not.toThrow()
    for (const change of [{ databaseUrl: 'postgresql://remote.example.test/audit' }, { nodeEnv: 'production' }, { dataTarget: 'RAILWAY_DB' }, { confirmed: false }]) expect(() => assertLocalCatalogReset({ ...input, ...change })).toThrow()
  })
  it('prevents swapped database modes and reports deployed data honestly', () => {
    expect(() => validateDatabaseTarget({ databaseUrl: 'postgresql://localhost/audit', dataTarget: 'LOCAL' })).not.toThrow()
    expect(() => validateDatabaseTarget({ databaseUrl: 'postgresql://remote.example.test/audit', dataTarget: 'LOCAL' })).toThrow()
    expect(() => validateDatabaseTarget({ databaseUrl: 'postgresql://localhost/audit', dataTarget: 'RAILWAY_DB', hasRailwayOverride: true })).toThrow()
    expect(() => validateDatabaseTarget({ databaseUrl: 'postgresql://remote.example.test/audit', dataTarget: 'RAILWAY_DB' })).toThrow()
    expect(() => validateDatabaseTarget({ databaseUrl: 'postgresql://remote.example.test/audit', dataTarget: 'RAILWAY_DB', hasRailwayOverride: true })).not.toThrow()
    vi.stubEnv('NODE_ENV', 'production'); expect(getAdminDataTarget().code).toBe('DEPLOYED')
  })
  it('fails closed on missing/weak signing secrets and insecure production auth origins', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('BETTER_AUTH_SECRET', ''); vi.stubEnv('ADMIN_SESSION_SECRET', '')
    expect(() => getAuthSecret()).toThrow()
    vi.stubEnv('BETTER_AUTH_SECRET', 'short'); expect(() => getAuthSecret()).toThrow()
    vi.stubEnv('BETTER_AUTH_URL', 'http://backend.example.test'); expect(() => getAuthBaseURL()).toThrow()
    vi.stubEnv('BETTER_AUTH_URL', 'https://user:password@backend.example.test'); expect(() => getAuthBaseURL()).toThrow()
    vi.stubEnv('BETTER_AUTH_URL', 'https://backend.example.test/api/customer-auth'); expect(() => getAuthBaseURL()).toThrow()
    vi.stubEnv('CLIENT_URL', 'https://store.example.test'); vi.stubEnv('FRONTEND_URL', '')
    expect(getTrustedAuthOrigins()).toEqual(['https://store.example.test'])
  })
  it('rejects profile type confusion and oversized fields', () => {
    for (const input of [null, [], { firstName: {} }, { phone: 'x'.repeat(41) }, { marketingOptIn: 'false' }, { defaultAddress: { city: [] } }, { notificationPreference: { marketingEmails: 'yes' } }]) expect(() => validateAccountProfile(input)).toThrow()
    expect(() => validateAccountProfile({ firstName: 'Alex', marketingOptIn: false, notificationPreference: { marketingEmails: false } })).not.toThrow()
  })
  it('keeps internal support events and order status notes out of customer projections', () => {
    const issue = { events: [{ eventType: 'INTERNAL_NOTE_ADDED', metadata: { emailRequested: false } }, { eventType: 'STATUS_CHANGED', metadata: { private: 'internal' } }] }
    expect(mapOrderIssue(issue).events).toHaveLength(1)
    expect(mapOrderIssue(issue).events[0].metadata).toBeNull()
    expect(mapOrderIssue(issue, { includeInternal: true }).events).toHaveLength(2)
    const order = mapCustomerOrder({ stripePaymentIntentId: 'pi_fixture', statusHistory: [{ fromStatus: 'PAID', toStatus: 'PROCESSING', note: 'private', changedBy: 'admin-id' }] })
    expect(order).not.toHaveProperty('stripePaymentIntentId')
    expect(order).not.toHaveProperty('statusHistory'); expect(order).not.toHaveProperty('lastStatusChange')
  })
  it('rejects script/insecure/credential-bearing tracking links', () => {
    const input = { carrier: 'usps', trackingNumber: 'TRACK123' }
    for (const trackingUrl of ['javascript:alert(1)', 'http://tracking.example.test', 'https://user:password@tracking.example.test', 'bad link']) expect(() => validateTrackingPayload({ ...input, trackingUrl })).toThrow()
    expect(validateTrackingPayload({ ...input, trackingUrl: 'https://tracking.example.test/TRACK123' }).trackingUrl).toContain('https://')
  })
  it('fails closed for an unconfigured or unauthorized non-mutating Shippo webhook', async () => {
    vi.stubEnv('SHIPPO_WEBHOOK_SECRET', '')
    const unavailable = response(); await postShippoWebhook({ get: () => '' }, unavailable); expect(unavailable.statusCode).toBe(503)
    vi.stubEnv('SHIPPO_WEBHOOK_SECRET', 'fixture-secret')
    const denied = response(); await postShippoWebhook({ get: () => 'wrong' }, denied); expect(denied.statusCode).toBe(401)
    const accepted = response(); await postShippoWebhook({ get: () => 'fixture-secret' }, accepted); expect(accepted.statusCode).toBe(200)
    expect(accepted.body.message).toContain('reserved')
  })
  it('limits both declared and chunked native auth bodies before auth processing', async () => {
    const handler = vi.fn(async request => { await request.json(); return Response.json({ success: true }) })
    const app = express(); app.all('/auth', boundedAuthHandler({ handler }))
    app.use((error, _req, res, _next) => res.status(500).json({ message: 'Fixture error.' }))
    server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve))
    const url = `http://127.0.0.1:${server.address().port}/auth`
    const body = JSON.stringify({ text: 'x'.repeat(101 * 1024) })
    expect((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })).status).toBe(413)
    const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(body)); controller.close() } })
    expect((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: stream, duplex: 'half' })).status).toBe(413)
    expect((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(200)
  })
})
