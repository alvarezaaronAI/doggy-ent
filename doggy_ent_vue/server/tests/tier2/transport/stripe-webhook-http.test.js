import { describe, expect, it, vi } from 'vitest'
import express from 'express'
import Stripe from 'stripe'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { createStripeWebhookHandler } from '../../../src/domains/payments/controllers/stripeWebhook.controller.js'

describe('loopback-only raw Stripe webhook transport (separate from offline suites)', () => {
  it('preserves signature bytes before JSON parsing, bounds bodies and acknowledges only saved events', async () => {
    const source = readFileSync(new URL('../../../src/app.js', import.meta.url), 'utf8')
    expect(source.indexOf("app.post('/api/payments/stripe/webhook', express.raw(")).toBeLessThan(source.indexOf('app.use(express.json('))
    const secret = 'whsec_fixture_only_never_deploy'
    const id = 'a1234567-1234-4123-8123-123456789abc'
    const save = vi.fn()
    const handler = createStripeWebhookHandler({ enabled: () => true, readSecret: () => secret,
      readConfig: () => ({ mode: 'sandbox', expectedAccountId: 'acct_fixture', issues: [] }),
      find: vi.fn(async () => ({ id, inputHash: 'a'.repeat(64), paymentMode: 'sandbox', stripeAccountId: 'acct_fixture' })), save,
    })
    const app = express()
    app.post('/webhook', express.raw({ type: 'application/json', limit: '100kb' }), handler)
    app.use(express.json())
    app.use((error, _req, res, _next) => res.status(error.status || 500).json({ success: false }))
    const server = app.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const url = `http://127.0.0.1:${server.address().port}/webhook`
    try {
      const body = JSON.stringify({ id: 'evt_fixture', livemode: false, type: 'payment_intent.succeeded', data: { object: { id: 'pi_fixture', metadata: { checkoutAttemptId: id, checkoutInputHash: 'a'.repeat(64) } } } })
      const signature = Stripe.webhooks.generateTestHeaderString({ payload: body, secret })
      const send = value => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': signature }, body: value })
      expect((await send(body)).status).toBe(200)
      expect(save).toHaveBeenCalledOnce()
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ attemptId: id, status: 'PENDING' }))
      expect((await send(body + ' ')).status).toBe(400)
      expect(save).toHaveBeenCalledOnce()
      expect((await send('x'.repeat(102401))).status).toBe(413)
      expect(save).toHaveBeenCalledOnce()
    } finally { await new Promise(resolve => server.close(resolve)) }
  })
})
