import { beforeEach, describe, expect, it, vi } from 'vitest'
import Stripe from 'stripe'
import { createStripeWebhookHandler } from '../../../src/domains/payments/controllers/stripeWebhook.controller.js'
import { drainCheckoutRecovery, startCheckoutRecoveryWorker } from '../../../src/domains/checkout/services/checkoutRecoveryWorker.service.js'

const id = 'a1234567-1234-4123-8123-123456789abc'
const secret = 'whsec_fixture_only_never_deploy'
const event = () => ({ id: 'evt_fixture', livemode: false, type: 'payment_intent.succeeded', data: { object: { id: 'pi_fixture', metadata: { checkoutAttemptId: id, checkoutInputHash: 'a'.repeat(64) }, client_secret: 'MUST_NOT_PERSIST', receipt_email: 'PRIVATE' } } })
const config = () => ({ mode: 'sandbox', expectedAccountId: 'acct_fixture', issues: [] })
let save, find, handler, res
beforeEach(() => {
  save = vi.fn()
  find = vi.fn(async () => ({ id, inputHash: 'a'.repeat(64), paymentIntentId: 'pi_fixture', paymentMode: 'sandbox', stripeAccountId: 'acct_fixture' }))
  handler = createStripeWebhookHandler({ readConfig: config, enabled: () => true, readSecret: () => secret, find, save })
  res = { set: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() }
})
const request = (body, signature) => ({ body: Buffer.from(body), get: () => signature })
const signature = body => Stripe.webhooks.generateTestHeaderString({ payload: body, secret })

describe('Stripe signed payment webhook without provider calls', () => {
  it('verifies the exact raw bytes and persists only minimized routing facts', async () => {
    const body = JSON.stringify(event())
    await handler(request(body, signature(body)), res)
    expect(save).toHaveBeenCalledWith({ id: 'evt_fixture', type: 'payment_intent.succeeded', paymentIntentId: 'pi_fixture', paymentMode: 'sandbox', stripeAccountId: 'acct_fixture', attemptId: id, status: 'PENDING' })
    expect(JSON.stringify(save.mock.calls)).not.toMatch(/MUST_NOT_PERSIST|PRIVATE/)
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })
  it.each(['missing', 'tampered', 'expired'])('rejects a %s signature before any storage lookup', async kind => {
    const body = JSON.stringify(event())
    const header = kind === 'missing' ? undefined : kind === 'expired'
      ? Stripe.webhooks.generateTestHeaderString({ payload: body, secret, timestamp: 1 }) : signature(body + ' ')
    await handler(request(body, header), res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(find).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
  })
  it.each([{ livemode: true }, { account: 'acct_foreign' }])('rejects the wrong mode or account', async changes => {
    const body = JSON.stringify({ ...event(), ...changes })
    await handler(request(body, signature(body)), res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(save).not.toHaveBeenCalled()
  })
  it('does not manufacture a checkout from an unknown or legacy payment', async () => {
    find.mockResolvedValue(null)
    const body = JSON.stringify(event())
    await handler(request(body, signature(body)), res)
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ status: 'IGNORED', attemptId: null }))
  })
  it.each([{ paymentIntentId: 'pi_legitimateOther' }, { inputHash: 'b'.repeat(64) }])('quarantines conflicting routing without changing the legitimate attempt: %j', async conflict => {
    find.mockResolvedValue({ id, inputHash: 'a'.repeat(64), paymentIntentId: 'pi_fixture', paymentMode: 'sandbox', stripeAccountId: 'acct_fixture', ...conflict })
    const body = JSON.stringify(event())
    await handler(request(body, signature(body)), res)
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ status: 'IGNORED', attemptId: null }))
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })
  it('returns retryable failure rather than acknowledging a failed inbox write', async () => {
    save.mockRejectedValue(new Error('private database diagnostic'))
    const body = JSON.stringify(event())
    await handler(request(body, signature(body)), res)
    expect(res.status).toHaveBeenCalledWith(503)
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('private database diagnostic')
  })
  it('is inert by default, including when the database has not migrated', async () => {
    await createStripeWebhookHandler({ enabled: () => false, readConfig: config, find, save })({}, res)
    expect(res.status).toHaveBeenCalledWith(503)
    expect(find).not.toHaveBeenCalled()
  })
})

describe('bounded payment recovery worker', () => {
  it('is inert when disabled and deduplicates attempt work across event/scan batches', async () => {
    const repo = { listPendingEvents: vi.fn(async () => [{ id: 'evt_1', attemptId: id, paymentIntentId: 'pi_fixture' }, { id: 'evt_2', attemptId: id, paymentIntentId: 'pi_fixture' }]),
      listRecoverableAttempts: vi.fn(async () => [{ id }, { id: 'another' }]), findAttempt: vi.fn(async () => ({ status: 'COMPLETED' })), finishEvents: vi.fn() }
    const service = { reconcile: vi.fn() }
    await drainCheckoutRecovery({ repo, service, enabled: () => false })
    expect(repo.listPendingEvents).not.toHaveBeenCalled()
    await drainCheckoutRecovery({ repo, service, enabled: () => true })
    expect(service.reconcile).toHaveBeenCalledTimes(2)
    expect(repo.finishEvents).toHaveBeenCalledWith(id)
  })
  it('prevents overlapping local ticks and supports cleanup', async () => {
    vi.useFakeTimers()
    let resolve
    const drain = vi.fn(() => new Promise(done => { resolve = done }))
    const stop = startCheckoutRecoveryWorker({ intervalMs: 100, drain })
    await vi.advanceTimersByTimeAsync(300)
    expect(drain).toHaveBeenCalledOnce()
    resolve()
    await vi.advanceTimersByTimeAsync(100)
    expect(drain).toHaveBeenCalledTimes(2)
    stop(); resolve()
    await vi.advanceTimersByTimeAsync(300)
    expect(drain).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})
