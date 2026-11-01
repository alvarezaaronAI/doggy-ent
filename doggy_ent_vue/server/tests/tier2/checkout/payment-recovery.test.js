import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCheckoutAttemptService } from '../../../src/domains/checkout/services/checkoutAttempt.service.js'
import { digest, assertAttemptPayment, normalizeAttemptInput } from '../../../src/domains/checkout/utils/checkoutAttempt.js'

const id = 'a1234567-1234-4123-8123-123456789abc', token = 'a'.repeat(64)
const customer = { firstName: 'Test', lastName: 'Buyer', email: 'buyer@example.invalid', address1: '1 Test Way', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'US' }
const input = () => ({ attemptId: id, recoveryToken: token, paymentMode: 'sandbox', customer,
  cartItems: [{ id: 'p1', size: '6 oz', quantity: 1 }], shipping: { method: 'standard' } })
const items = [{ id: 'p1', productId: 'p1', variantId: 'v1', name: 'Treat', size: '6 oz', sku: 'SKU1', price: 10, quantity: 1 }]
const quote = { pricing: { subtotal: 10, shippingAmount: 5, discountAmount: 0, taxAmount: 0, total: 15 }, shipping: { method: 'standard' }, campaigns: [], promo: null, taxSnapshot: null }
let row, time, repo, ctx, service, intent, preview, finalize
beforeEach(() => {
  row = null
  time = Date.parse('2026-10-31T00:00:00Z')
  intent = { id: 'pi_fixture', amount: 1500, currency: 'usd', livemode: false, status: 'requires_payment_method', client_secret: 'ephemeral-fixture-only', metadata: { checkoutAttemptId: id, checkoutInputHash: digest(JSON.stringify(normalizeAttemptInput(input()))) } }
  repo = {
    findAttempt: vi.fn(async () => row),
    insertAttempt: vi.fn(async data => (row = { ...data, createdAt: new Date(time), status: 'PREPARED', retryCount: 0 })),
    claimAttempt: vi.fn(async () => 'lease'), releaseAttempt: vi.fn(), finishEvents: vi.fn(),
    updateClaimedAttempt: vi.fn(async (_id, _lease, data) => {
      for (const [key, value] of Object.entries(data)) row[key] = value?.increment ? (row[key] || 0) + value.increment : value
      return { count: 1 }
    }),
  }
  ctx = { mode: 'sandbox', accountId: 'acct_fixture', stripe: { paymentIntents: {
    create: vi.fn(async () => intent), retrieve: vi.fn(async () => intent),
    cancel: vi.fn(async () => ({ ...intent, status: 'canceled' })),
  } } }
  preview = vi.fn(async () => quote)
  finalize = vi.fn(async () => { row.status = 'COMPLETED'; row.orderId = 'o1' })
  service = createCheckoutAttemptService({ repo, context: vi.fn(async () => ctx), resolveItems: vi.fn(async () => items),
    preview, finalize, now: () => time, enabled: () => true,
    findOrder: vi.fn(async () => ({ orderNumber: 'DGE-fixture' })),
  })
  vi.stubEnv('PAYMENT_MODE', 'sandbox')
  vi.stubEnv('PAYMENTS_ENABLED', 'true')
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fixture')
  vi.stubEnv('STRIPE_EXPECTED_ACCOUNT_ID', 'acct_fixture')
  vi.stubEnv('CHECKOUT_RECOVERY_ENABLED', 'false')
})

describe('saved checkout attempts with injected provider/storage boundaries', () => {
  it('does no storage or provider work while recovery is disabled', async () => {
    const disabled = createCheckoutAttemptService({ repo, enabled: () => false })
    await expect(disabled.prepare(input())).rejects.toMatchObject({ code: 'CHECKOUT_RECOVERY_UNAVAILABLE' })
    await expect(disabled.status(id, token)).rejects.toMatchObject({ code: 'CHECKOUT_RECOVERY_UNAVAILABLE' })
    expect(repo.findAttempt).not.toHaveBeenCalled()
    expect(repo.insertAttempt).not.toHaveBeenCalled()
  })
  it('persists the frozen agreement and hashed proof before provider creation', async () => {
    ctx.stripe.paymentIntents.create.mockImplementation(async () => {
      expect(row.snapshot.items).toEqual(items)
      expect(row.recoveryHash).toBe(digest(token))
      expect(JSON.stringify(row)).not.toContain(token)
      return intent
    })
    const first = await service.prepare(input())
    expect(first.clientSecret).toBe(intent.client_secret)
    expect(first.result.attempt.allowedActions).toEqual(['confirm', 'cancel'])
    expect(ctx.stripe.paymentIntents.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 1500, metadata: intent.metadata }), { idempotencyKey: `checkout-attempt-${id}-v1` })
    expect(JSON.stringify(row)).not.toContain('ephemeral-fixture-only')
    expect(repo.releaseAttempt).toHaveBeenCalledWith(id, 'lease')
  })
  it('reuses one payment and never reprices a retry after catalog changes', async () => {
    await service.prepare(input())
    preview.mockRejectedValue(new Error('Must not reprice'))
    await service.prepare(input())
    expect(preview).toHaveBeenCalledTimes(1)
    expect(ctx.stripe.paymentIntents.create).toHaveBeenCalledTimes(1)
    expect(ctx.stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_fixture')
  })
  it('freezes a legacy fractional percentage using its normalized display value and exact caps', async () => {
    repo.findPromoAgreement = vi.fn(async () => ({ id: 'promo_fixture', code: 'TWENTY', name: 'Twenty', discountType: 'PERCENT', discountValue: 0.2, usageLimitTotal: 0, usageLimitPerCustomer: null }))
    preview.mockResolvedValue({ ...quote, pricing: { ...quote.pricing, discountAmount: 2, total: 13 }, promo: { valid: true, code: 'TWENTY', discountType: 'PERCENT', discountValue: 20, discountAmount: 2 } })
    const value = { ...input(), promoCode: 'TWENTY' }
    intent = { ...intent, amount: 1300, metadata: { ...intent.metadata, checkoutInputHash: digest(JSON.stringify(normalizeAttemptInput(value))) } }
    await service.prepare(value)
    expect(row.snapshot.promoAgreement).toMatchObject({ promoId: 'promo_fixture', usageLimitTotal: 0, usageLimitPerCustomer: null })
    expect(row.snapshot.preview.promo.discountValue).toBe(20)
  })
  it('replays an identical idempotency key after a lost create response', async () => {
    ctx.stripe.paymentIntents.create.mockRejectedValueOnce(new Error('Ambiguous provider response'))
    await expect(service.prepare(input())).rejects.toThrow()
    expect(row.paymentIntentId).toBeUndefined()
    await service.prepare(input())
    expect(repo.insertAttempt).toHaveBeenCalledTimes(1)
    const calls = ctx.stripe.paymentIntents.create.mock.calls
    expect(calls[0]).toEqual(calls[1])
  })
  it('does not create on status reads or accept an ID without its exact capability', async () => {
    await service.prepare(input())
    await expect(service.status(id, 'b'.repeat(64))).rejects.toMatchObject({ statusCode: 404 })
    await service.status(id, token)
    expect(ctx.stripe.paymentIntents.create).toHaveBeenCalledTimes(1)
  })
  it('rejects same-total changes before returning a client secret', async () => {
    await service.prepare(input())
    await expect(service.prepare({ ...input(), customer: { ...customer, zip: '90002' } })).rejects.toMatchObject({ code: 'CHECKOUT_INPUT_CHANGED' })
    expect(ctx.stripe.paymentIntents.create).toHaveBeenCalledTimes(1)
  })
  it('finishes a verified succeeded payment from the saved quote and returns receipt access', async () => {
    await service.prepare(input())
    intent = { ...intent, status: 'succeeded', amount_received: 1500 }
    const result = await service.status(id, token)
    expect(finalize).toHaveBeenCalledWith(id, { paymentIntentId: 'pi_fixture', leaseToken: 'lease' })
    expect(result.orderReference).toBe('DGE-fixture')
    expect(typeof result.receiptAccess).toBe('string')
    await service.status(id, token)
    expect(finalize).toHaveBeenCalledTimes(1)
    expect(preview).toHaveBeenCalledTimes(1)
  })
  it('binds a signed event payment after creation succeeded but saving its ID failed', async () => {
    await service.prepare(input())
    row.paymentIntentId = null
    intent = { ...intent, status: 'succeeded', amount_received: 1500 }
    await service.reconcile(id, { eventPaymentIntentId: 'pi_fixture' })
    expect(row.status).toBe('COMPLETED')
    expect(finalize).toHaveBeenCalledOnce()
  })
  it('never creates a second payment to replace an expired ambiguous creation', async () => {
    ctx.stripe.paymentIntents.create.mockRejectedValueOnce(new Error('Lost response'))
    await expect(service.prepare(input())).rejects.toThrow()
    time += 13 * 60 * 60 * 1000
    await expect(service.status(id, token, { cancel: true })).rejects.toMatchObject({ code: 'CHECKOUT_CREATE_EXPIRED' })
    expect(ctx.stripe.paymentIntents.create).toHaveBeenCalledTimes(1)
    expect(row.status).toBe('PAID_REVIEW')
  })
  it('handles cancellation-vs-success by finishing the original paid checkout', async () => {
    await service.prepare(input())
    ctx.stripe.paymentIntents.cancel.mockImplementation(async () => {
      intent = { ...intent, status: 'succeeded', amount_received: 1500 }
      throw new Error('Already paid')
    })
    const result = await service.status(id, token, { cancel: true })
    expect(result.attempt.status).toBe('COMPLETED')
    expect(finalize).toHaveBeenCalledOnce()
  })
  it('keeps unknown/processing states locked and records paid-but-unfulfillable review', async () => {
    await service.prepare(input())
    intent = { ...intent, status: 'processing' }
    expect((await service.status(id, token)).attempt.allowedActions).toEqual([])
    intent = { ...intent, status: 'succeeded', amount_received: 1500 }
    finalize.mockRejectedValue(Object.assign(new Error('No stock'), { code: 'CHECKOUT_STOCK_UNAVAILABLE', statusCode: 409 }))
    await expect(service.status(id, token)).rejects.toMatchObject({ statusCode: 409 })
    expect(row.status).toBe('PAID_REVIEW')
    expect(row.paidAt).toBeTruthy()
    expect((await service.status(id, token)).attempt.allowedActions).toEqual([])
  })
  it.each(['amount', 'currency', 'livemode', 'metadata', 'tax'])('rejects a different canonical %s binding without finalization', async field => {
    await service.prepare(input())
    intent = { ...intent, status: 'succeeded', amount_received: 1500 }
    if (field === 'amount') intent.amount_received = 1
    if (field === 'currency') intent.currency = 'eur'
    if (field === 'livemode') intent.livemode = true
    if (field === 'metadata') intent.metadata = {}
    if (field === 'tax') intent.hooks = { inputs: { tax: { calculation: 'taxcalc_foreign' } } }
    await expect(service.status(id, token)).rejects.toMatchObject({ code: 'PAYMENT_BINDING_MISMATCH' })
    expect(finalize).not.toHaveBeenCalled()
    expect(row.status).toBe('PAID_REVIEW')
  })
  it('stops expired capability access and rejects mismatched verified accounts', async () => {
    await service.prepare(input())
    expect(() => assertAttemptPayment(row, intent, { ...ctx, accountId: 'acct_foreign' })).toThrow()
    time += 8 * 24 * 60 * 60 * 1000
    await expect(service.status(id, token)).rejects.toMatchObject({ statusCode: 404 })
  })
  it('uses the database lease rather than double-finalizing concurrent requests', async () => {
    await service.prepare(input())
    repo.claimAttempt.mockResolvedValue(null)
    await service.status(id, token)
    expect(finalize).not.toHaveBeenCalled()
    expect(ctx.stripe.paymentIntents.retrieve).not.toHaveBeenCalled()
  })
})
