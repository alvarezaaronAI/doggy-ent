import { beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({ checkoutAttempt: { findUnique: vi.fn() }, $transaction: vi.fn() }))
const receipts = vi.hoisted(() => ({ prepareCheckoutReceipt: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
vi.mock('../../../src/domains/emails/services/checkoutReceipt.service.js', () => receipts)
const { finalizeCheckoutAttempt } = await import('../../../src/domains/checkout/repositories/checkoutFinalization.repository.js')

const copy = value => structuredClone(value)
const lease = 'fixture-lease'
const options = id => ({ paymentIntentId: `pi_fixture_${id}`, leaseToken: lease })
function attempt(id = 'a', email = 'fixture@example.test') {
  return {
    id, inputHash: 'fixture-input', userId: null, paymentIntentId: options(id).paymentIntentId,
    amountCents: 2400, currency: 'usd', paymentMode: 'sandbox', stripeAccountId: 'acct_fixture',
    status: 'PAID_PENDING_ORDER', leaseToken: lease, leaseUntil: new Date(Date.now() + 60000),
    paidAt: new Date(), orderId: null,
    snapshot: {
      version: 1, userId: 'deleted-owner',
      items: [{ productId: 'p', variantId: 'v', id: 'p', name: 'Frozen treat', image: null, size: '6 oz', price: 10, sku: 'FIXTURE-6', variant: { sku: 'FIXTURE-6' }, quantity: 2 }],
      customer: { firstName: 'Fixture', lastName: 'Customer', email, country: 'US' },
      preview: {
        pricing: { subtotal: 20, discountAmount: 2, shippingAmount: 5, taxAmount: 1, total: 24 },
        shipping: { method: 'standard', carrier: 'Fixture carrier', service: 'Ground', rateId: 'fixture-rate', provider: 'STATIC' },
        taxSnapshot: null, promo: { valid: true, code: 'FROZEN', discountAmount: 2 },
        campaigns: [{ campaignId: 'c', campaignName: 'Frozen campaign', donationTarget: 'Frozen beneficiary', donationType: 'PERCENT', donationValue: 10, matchedSubtotal: 20, donationAmount: 2, matchedProductIds: ['p'] }],
      },
      promoAgreement: { promoId: 'promo', code: 'FROZEN', name: 'Frozen promo', usageLimitTotal: null, usageLimitPerCustomer: 1 },
    },
  }
}

let state, revision, failAt, beforeTransaction, ambiguousCommit
function fixtureFailure(stage) {
  if (failAt === stage) throw Object.assign(new Error('Fixture write failed'), { code: 'FIXTURE_FAILURE' })
}
// Optimistic snapshots exercise fresh retries and rollback; PostgreSQL acceptance is separate.
function transactionStore(working, markDirty) {
  const readOrder = where => {
    const row = Object.values(working.orders).find(order => where.id ? order.id === where.id : order.stripePaymentIntentId === where.stripePaymentIntentId)
    return row ? copy({ ...row, campaignUsages: working.campaignUsages.filter(usage => usage.orderId === row.id).map(usage => ({ ...usage, campaign: working.campaigns[usage.campaignId] })), emailDeliveries: working.receipts.filter(receipt => receipt.orderId === row.id) }) : null
  }
  return {
    checkoutAttempt: {
      findUnique: async ({ where }) => copy(working.attempts[where.id] || null),
      updateMany: async ({ where, data }) => {
        const row = working.attempts[where.id]
        if (!row || row.leaseToken !== where.leaseToken || row.leaseUntil <= where.leaseUntil.gt) return { count: 0 }
        Object.assign(row, data); markDirty(); return { count: 1 }
      },
      update: async ({ where, data }) => {
        fixtureFailure('attemptComplete'); Object.assign(working.attempts[where.id], data); markDirty()
        return copy(working.attempts[where.id])
      },
    },
    productVariant: {
      findUnique: async ({ where }) => copy(Object.values(working.variants).find(row => where.id ? row.id === where.id : row.sku === where.sku) || null),
      updateMany: async ({ where, data }) => {
        const row = working.variants[where.id]
        if (!row || row.inventory < where.inventory.gte) return { count: 0 }
        row.inventory -= data.inventory.decrement; markDirty(); return { count: 1 }
      },
    },
    order: {
      findUnique: async ({ where }) => readOrder(where),
      create: async ({ data }) => {
        if (Object.values(working.orders).some(order => order.stripePaymentIntentId === data.stripePaymentIntentId)) throw { code: 'P2002' }
        const id = `order-${Object.keys(working.orders).length + 1}`
        const { items, emailDeliveries, ...fields } = data
        working.orders[id] = { ...fields, id, items: items.create, createdAt: new Date(), updatedAt: new Date() }
        if (emailDeliveries) { fixtureFailure('receipt'); working.receipts.push({ ...emailDeliveries.create, id: `receipt-${id}`, orderId: id }) }
        markDirty(); return readOrder({ id })
      },
    },
    promo: {
      findUnique: async ({ where }) => copy(working.promos[where.id] || null),
      update: async ({ where, data }) => {
        fixtureFailure('promoCounter'); const row = working.promos[where.id]
        for (const [key, value] of Object.entries(data)) row[key] += value.increment
        markDirty(); return copy(row)
      },
    },
    promoUsage: {
      count: async ({ where }) => working.promoUsages.filter(row => row.promoId === where.promoId && (!where.customerEmail || row.customerEmail === where.customerEmail)).length,
      create: async ({ data }) => { fixtureFailure('promoUsage'); working.promoUsages.push(copy(data)); markDirty(); return copy(data) },
    },
    campaign: {
      findUnique: async ({ where }) => copy(working.campaigns[where.id] || null),
      update: async ({ where, data }) => {
        fixtureFailure('campaignCounter'); const row = working.campaigns[where.id]
        for (const [key, value] of Object.entries(data)) row[key] += value.increment
        markDirty(); return copy(row)
      },
    },
    orderCampaignUsage: { create: async ({ data }) => { fixtureFailure('campaignUsage'); working.campaignUsages.push(copy(data)); markDirty(); return copy(data) } },
  }
}

beforeEach(() => {
  vi.resetAllMocks(); revision = 0; failAt = null; beforeTransaction = null; ambiguousCommit = false
  state = {
    attempts: { a: attempt() }, orders: {}, receipts: [], promoUsages: [], campaignUsages: [],
    variants: { v: { id: 'v', productId: 'p', size: '6 oz', sku: 'FIXTURE-6', inventory: 2, price: 99999, isActive: true, product: { status: 'ACTIVE', sellingMode: 'INVENTORY_LIMITED', isTestProduct: false } } },
    promos: { promo: { id: 'promo', code: 'CHANGED', discountValue: 99, usageLimitPerCustomer: 0, usedCount: 0, revenueGenerated: 0, discountGiven: 0 } },
    campaigns: { c: { id: 'c', name: 'Changed campaign', donationTarget: 'Changed beneficiary', donationValue: 99, orderCount: 0, revenueGenerated: 0, donationGenerated: 0 } },
  }
  db.checkoutAttempt.findUnique.mockImplementation(async ({ where }) => copy(state.attempts[where.id] || null))
  receipts.prepareCheckoutReceipt.mockImplementation(async order => ({ dedupeKey: `fixture-${order.stripePaymentIntentId}`, recipient: order.customerEmail, automatic: true, event: 'ORDER_CONFIRMATION', status: 'QUEUED', provider: 'MOCK' }))
  db.$transaction.mockImplementation(async (action, config) => {
    expect(config).toEqual({ isolationLevel: 'Serializable' })
    if (beforeTransaction) { const hook = beforeTransaction; beforeTransaction = null; hook() }
    const start = revision, working = copy(state)
    let dirty = false
    const result = await action(transactionStore(working, () => { dirty = true }))
    if (dirty && start !== revision) throw { code: 'P2034' }
    if (dirty) { state = working; revision++ }
    if (ambiguousCommit) { ambiguousCommit = false; throw new Error('Fixture connection lost after commit') }
    return result
  })
})

const finalize = id => finalizeCheckoutAttempt(id, options(id))
function assertOneOrder() {
  expect(Object.values(state.orders)).toHaveLength(1)
  expect(state.receipts).toHaveLength(1); expect(state.promoUsages).toHaveLength(1); expect(state.campaignUsages).toHaveLength(1)
  expect(state.promos.promo).toMatchObject({ usedCount: 1, revenueGenerated: 20, discountGiven: 2 })
  expect(state.campaigns.c).toMatchObject({ orderCount: 1, revenueGenerated: 20, donationGenerated: 2 })
}

describe('durable atomic checkout finalization', () => {
  it('commits frozen money, attribution, one receipt and row-authoritative ownership together', async () => {
    const order = await finalize('a')
    assertOneOrder(); expect(state.variants.v.inventory).toBe(0)
    expect(order).toMatchObject({ total: 24, userId: null, items: [{ productName: 'Frozen treat', unitPrice: 10, lineTotal: 20 }], promoUsage: { promoCode: 'FROZEN', discountAmount: 2 }, campaignAttributions: [{ donationTarget: 'Frozen beneficiary', donationAmount: 2 }] })
    expect(state.attempts.a).toMatchObject({ status: 'COMPLETED', orderId: order.id, leaseToken: null, leaseUntil: null, completedAt: expect.any(Date) })
    expect(receipts.prepareCheckoutReceipt).toHaveBeenCalledWith(expect.objectContaining({ userId: null, donationAmount: 2, campaignAttributions: [expect.objectContaining({ donationTarget: 'Frozen beneficiary' })] }))
  })
  it('completes simultaneous same-attempt requests at last stock exactly once', async () => {
    const results = await Promise.all([finalize('a'), finalize('a')])
    expect(results[0].id).toBe(results[1].id); assertOneOrder(); expect(state.variants.v.inventory).toBe(0)
  })
  it.each(['stock', 'per-email', 'total'])('rolls back the losing different attempt for %s contention', async type => {
    state.attempts.b = attempt('b', type === 'total' ? 'other@example.test' : 'fixture@example.test')
    if (type !== 'stock') state.variants.v.inventory = 4
    if (type === 'total') for (const row of Object.values(state.attempts)) Object.assign(row.snapshot.promoAgreement, { usageLimitTotal: 1, usageLimitPerCustomer: null })
    const results = await Promise.allSettled([finalize('a'), finalize('b')])
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.find(result => result.status === 'rejected').reason).toMatchObject({ statusCode: 409, code: type === 'stock' ? 'CHECKOUT_STOCK_UNAVAILABLE' : 'CHECKOUT_PROMO_LIMIT' })
    assertOneOrder(); expect(state.variants.v.inventory).toBe(type === 'stock' ? 0 : 2)
    expect(Object.values(state.attempts).filter(row => row.status === 'PAID_PENDING_ORDER')).toHaveLength(1)
  })
  it.each(['receipt', 'promoUsage', 'promoCounter', 'campaignUsage', 'campaignCounter', 'attemptComplete'])('rolls back all writes on %s failure then recovers the same payment', async stage => {
    const original = copy(state); failAt = stage
    await expect(finalize('a')).rejects.toMatchObject({ code: 'FIXTURE_FAILURE' })
    expect(state).toEqual(original)
    failAt = null; await finalize('a'); assertOneOrder(); expect(state.variants.v.inventory).toBe(0)
  })
  it('does not commit when receipt preparation fails and can retry', async () => {
    receipts.prepareCheckoutReceipt.mockRejectedValueOnce(new Error('Private provider configuration'))
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_RECEIPT_PREPARATION_FAILED', statusCode: 503 })
    expect(state.variants.v.inventory).toBe(2); expect(Object.keys(state.orders)).toHaveLength(0)
    await finalize('a'); assertOneOrder()
  })
  it('replays completed saved orders before lease, snapshot, stock or receipt revalidation', async () => {
    const first = await finalize('a')
    state.orders[first.id].status = 'SHIPPED'; state.attempts.a.snapshot = null
    receipts.prepareCheckoutReceipt.mockClear()
    expect(await finalizeCheckoutAttempt('a', { paymentIntentId: options('a').paymentIntentId, leaseToken: 'stale' })).toMatchObject({ id: first.id, status: 'SHIPPED' })
    expect(receipts.prepareCheckoutReceipt).not.toHaveBeenCalled(); assertOneOrder()
  })
  it('returns the concurrent completed winner even if this caller failed receipt preparation', async () => {
    const stale = copy(state.attempts.a); const first = await finalize('a')
    db.checkoutAttempt.findUnique.mockResolvedValueOnce(stale)
    receipts.prepareCheckoutReceipt.mockRejectedValueOnce(new Error('Fixture preparation failure'))
    expect((await finalize('a')).id).toBe(first.id); assertOneOrder()
  })
  it('recovers an unknown commit outcome without another deduction or receipt', async () => {
    ambiguousCommit = true
    await expect(finalize('a')).rejects.toThrow('Fixture connection lost after commit')
    const result = await finalize('a'); expect(result.id).toBe(state.attempts.a.orderId); assertOneOrder()
    expect(state.variants.v.inventory).toBe(0)
  })
  it.each(['promo', 'campaign', 'variant'])('rejects deleted %s records without partial effects', async type => {
    if (type === 'promo') delete state.promos.promo
    if (type === 'campaign') delete state.campaigns.c
    if (type === 'variant') delete state.variants.v
    const original = copy(state)
    await expect(finalize('a')).rejects.toMatchObject({ statusCode: 409, code: { promo: 'CHECKOUT_PROMO_UNAVAILABLE', campaign: 'CHECKOUT_CAMPAIGN_UNAVAILABLE', variant: 'CHECKOUT_VARIANT_UNAVAILABLE' }[type] })
    expect(state).toEqual(original)
  })
  it.each(['expired', 'wrong', 'invalid-date'])('rejects an %s lease with a retryable error', async type => {
    if (type === 'expired') state.attempts.a.leaseUntil = new Date(0)
    if (type === 'wrong') state.attempts.a.leaseToken = 'foreign'
    if (type === 'invalid-date') state.attempts.a.leaseUntil = 'invalid'
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_LEASE_LOST', statusCode: 503 })
    expect(Object.keys(state.orders)).toHaveLength(0)
  })
  it('validates the payment again inside the transaction', async () => {
    beforeTransaction = () => { state.attempts.a.paymentIntentId = 'pi_other' }
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_PAYMENT_MISMATCH' })
    expect(Object.keys(state.orders)).toHaveLength(0)
  })
  it('requires persisted paid evidence before writing an order', async () => {
    state.attempts.a.status = 'OPEN'; state.attempts.a.paidAt = null
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_PAYMENT_NOT_READY', statusCode: 503 })
  })
  it('rejects a changed saved agreement after receipt preparation', async () => {
    beforeTransaction = () => { state.attempts.a.snapshot.preview.promo.discountAmount = 3 }
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_SNAPSHOT_INVALID' })
    expect(Object.keys(state.orders)).toHaveLength(0)
  })
  it.each(['P2034', 'P2002'])('bounds %s retries to three fresh serializable transactions', async code => {
    db.$transaction.mockRejectedValue({ code, message: 'Private database details' })
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_FINALIZATION_BUSY', statusCode: 503 })
    expect(db.$transaction).toHaveBeenCalledTimes(3); expect(receipts.prepareCheckoutReceipt).toHaveBeenCalledOnce()
    expect(Object.keys(state.orders)).toHaveLength(0)
  })
  it('never adopts an unrelated existing order for the same payment', async () => {
    state.orders.other = { id: 'other', stripePaymentIntentId: options('a').paymentIntentId }
    await expect(finalize('a')).rejects.toMatchObject({ code: 'CHECKOUT_ORDER_CONFLICT' })
    expect(state.variants.v.inventory).toBe(2)
  })
})
