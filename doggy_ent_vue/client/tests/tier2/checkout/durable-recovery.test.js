import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, ref } from 'vue'
import { useCheckoutRecovery } from '../../../src/domains/checkout/composables/useCheckoutRecovery.js'
import { cartFingerprint, CHECKOUT_RECOVERY_KEY, clearRecoveredCart, newCheckoutRecovery, readCheckoutRecovery, RECOVERY_LIFETIME_MS, saveCheckoutRecovery } from '../../../src/domains/checkout/utils/checkoutRecovery.js'
import { getReceiptAccess } from '../../../src/domains/checkout/utils/receiptAccess.js'

const api = vi.hoisted(() => ({ configuration: vi.fn(), create: vi.fn(), get: vi.fn(), finalize: vi.fn(), cancel: vi.fn() }))
vi.mock('../../../src/domains/payments/services/payment.service.js', () => ({ getPaymentConfiguration: api.configuration, createPaymentIntent: api.create }))
vi.mock('../../../src/domains/checkout/api/checkoutRecovery.api.js', async original => ({ ...await original(), fetchCheckoutAttempt: api.get, finalizeCheckoutAttempt: api.finalize, cancelCheckoutAttempt: api.cancel }))

const items = [{ productId: 'fixture-product', size: '6 oz', quantity: 1 }]
const draft = () => ({ cartItems: structuredClone(items), customer: { email: 'fixture@example.test', address1: '1 Example Street', country: 'United States' }, shipping: { method: 'standard' }, promoCode: null })
const apps = []
let saved, server, storageEvents
function result(id, status = 'OPEN', extra = {}) {
  return { attempt: { id, status, amountCents: 1499, currency: 'usd',
    expiresAt: new Date(Date.now() + 600000).toISOString(), recoveryExpiresAt: new Date(Date.now() + RECOVERY_LIFETIME_MS).toISOString(),
    items, customer: draft().customer, shipping: draft().shipping, pricing: { subtotal: 14.99, total: 14.99 },
    allowedActions: ['PREPARED', 'OPEN'].includes(status) ? ['confirm', 'cancel'] : status === 'PAID_PENDING_ORDER' ? ['finalize'] : [], ...extra },
    ...(status === 'COMPLETED' ? { orderReference: 'CE-OFFLINE', receiptAccess: 'offline-receipt' } : {}) }
}
function mount(overrides = {}) {
  const payload = ref(draft()), total = ref(14.99), complete = vi.fn()
  let state
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() {
    state = useCheckoutRecovery({ getPayload: () => payload.value, getTotal: () => total.value, onComplete: complete, ...overrides })
    return () => h('div')
  } })
  app.mount({}); apps.push(app)
  return { state, payload, total, complete, unmount: () => { app.unmount(); apps.splice(apps.indexOf(app), 1) } }
}
async function persist(status = 'OPEN') {
  const record = newCheckoutRecovery(await cartFingerprint(items))
  saveCheckoutRecovery(record)
  server = result(record.id, status)
  return record
}
function executor(flow, action = async () => {}) {
  return vi.fn(async () => {
    await flow.state.preparePayment(flow.payload.value, flow.total.value)
    await action()
    return { status: 'succeeded' }
  })
}

beforeEach(() => {
  vi.clearAllMocks(); saved = new Map(); storageEvents = new Map(); server = null
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('navigator', { locks: { request: vi.fn(async (_name, _options, callback) => callback({})) } })
  vi.stubGlobal('localStorage', { getItem: vi.fn(key => saved.get(key) ?? null), setItem: vi.fn((key, value) => saved.set(key, value)), removeItem: vi.fn(key => saved.delete(key)) })
  vi.stubGlobal('window', { addEventListener: (key, fn) => storageEvents.set(key, fn), removeEventListener: key => storageEvents.delete(key) })
  api.configuration.mockResolvedValue({ recoveryEnabled: true })
  api.get.mockImplementation(async record => server || result(record.id))
  api.create.mockImplementation(async payload => {
    server = result(payload.attemptId)
    return { success: true, clientSecret: 'offline-client-secret', pricing: { total: 14.99 }, result: server }
  })
  api.finalize.mockImplementation(async record => (server = result(record.id, 'COMPLETED')))
  api.cancel.mockImplementation(async record => (server = result(record.id, 'CANCELED')))
})
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); vi.unstubAllGlobals() })

describe('durable checkout payment coordination', () => {
  it('persists only the bounded opaque handle before the provider POST, then finalizes once', async () => {
    const flow = mount(); await flow.state.initialize()
    api.create.mockImplementationOnce(async payload => {
      const record = readCheckoutRecovery()
      expect(record.id).toBe(payload.attemptId); expect(record.token).toBe(payload.recoveryToken)
      expect(Object.keys(record).sort()).toEqual(['cartFingerprint', 'expiresAt', 'id', 'token'])
      expect(record.token).toMatch(/^[a-f0-9]{64}$/)
      expect(Date.parse(record.expiresAt) - Date.now()).toBeLessThanOrEqual(RECOVERY_LIFETIME_MS)
      expect(saved.get(CHECKOUT_RECOVERY_KEY)).not.toMatch(/email|address|clientSecret|offline-client-secret/)
      server = result(record.id)
      return { clientSecret: 'offline-client-secret', pricing: { total: 14.99 }, result: server }
    })
    const confirm = executor(flow, async () => { server = result(readCheckoutRecovery().id, 'PAID_PENDING_ORDER') })
    expect(await flow.state.pay(confirm, () => true)).toBe(true)
    expect(api.finalize).toHaveBeenCalledOnce(); expect(flow.complete).toHaveBeenCalledOnce()
    expect(flow.state.paid.value).toBe(true); expect(readCheckoutRecovery().token).toBeTruthy()
    await flow.state.pay(confirm, () => true)
    expect(confirm).toHaveBeenCalledOnce(); expect(api.create).toHaveBeenCalledOnce()
  })

  it('keeps the same identity after a lost creation response and reuses it on explicit retry', async () => {
    const flow = mount(); await flow.state.initialize()
    api.create.mockImplementationOnce(async payload => { server = result(payload.attemptId); throw new Error('private-network-response') })
    const confirm = executor(flow)
    await flow.state.pay(confirm, () => true)
    const original = readCheckoutRecovery()
    expect(flow.state.message.value).toContain('Do not pay again')
    await flow.state.pay(confirm, () => true)
    expect(api.create.mock.calls.map(([payload]) => payload.attemptId)).toEqual([original.id, original.id])
    expect(readCheckoutRecovery()).toEqual(original)
  })

  it.each(['PROCESSING', 'PAID_REVIEW'])('reconciles an ambiguous confirmation to %s and never confirms again', async status => {
    const flow = mount(); await flow.state.initialize()
    const confirm = executor(flow, async () => { server = result(readCheckoutRecovery().id, status); throw new Error('private-timeout') })
    await flow.state.pay(confirm, () => true)
    expect(flow.state.attempt.value.status).toBe(status)
    expect(flow.state.locked.value).toBe(true)
    await flow.state.pay(confirm, () => true); await flow.state.check()
    expect(confirm).toHaveBeenCalledOnce(); expect(api.create).toHaveBeenCalledOnce()
  })

  it('recovers paid checkout after reload with empty bag, disabled creation and no Stripe dependency', async () => {
    const record = await persist('PAID_PENDING_ORDER')
    api.configuration.mockResolvedValue({ enabled: false, recoveryEnabled: false })
    const flow = mount(); flow.payload.value.cartItems = []; flow.total.value = null
    await flow.state.initialize()
    expect(api.get).toHaveBeenCalledWith(record); expect(api.finalize).toHaveBeenCalledWith(record)
    expect(flow.complete).not.toHaveBeenCalled()
    expect(getReceiptAccess('CE-OFFLINE')).toBe('offline-receipt')
    await flow.state.check()
    expect(flow.complete).toHaveBeenCalledWith(expect.objectContaining({ orderReference: 'CE-OFFLINE', receiptAccess: 'offline-receipt' }), record.cartFingerprint)
    expect(api.create).not.toHaveBeenCalled()
  })

  it('retains an unknown attempt across failure, unmount and a fresh coordinator', async () => {
    const record = await persist()
    api.get.mockRejectedValueOnce(new Error('private-provider-detail'))
    const first = mount(); await first.state.initialize()
    expect(first.state.locked.value).toBe(true); expect(first.state.attempt.value).toBeNull()
    expect(readCheckoutRecovery()).toEqual(record)
    first.unmount()
    const second = mount(); await second.state.initialize()
    expect(second.state.attempt.value.id).toBe(record.id)
    expect(api.create).not.toHaveBeenCalled()
  })

  it('retries only preparation after a missing initial response, never confirms automatically', async () => {
    const record = await persist(); api.get.mockRejectedValue(new Error('Unavailable'))
    const flow = mount(); await flow.state.initialize()
    expect(flow.state.canPrepare.value).toBe(true)
    await flow.state.retryPreparation()
    expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ attemptId: record.id, recoveryToken: record.token }))
    expect(flow.complete).not.toHaveBeenCalled(); expect(api.finalize).not.toHaveBeenCalled()
  })

  it('requires cancellation before a changed cart and releases only a canonically canceled attempt', async () => {
    const record = await persist(), flow = mount(); await flow.state.initialize()
    flow.payload.value.cartItems[0].quantity = 2
    const confirm = executor(flow)
    await flow.state.pay(confirm, () => true)
    expect(api.create).not.toHaveBeenCalled(); expect(flow.state.message.value).toContain('checkout changed')
    expect(flow.state.locked.value).toBe(true); expect(readCheckoutRecovery().id).toBe(record.id)
    api.cancel.mockResolvedValueOnce(result(record.id, 'PROCESSING'))
    await flow.state.cancel()
    expect(readCheckoutRecovery().id).toBe(record.id); expect(flow.state.locked.value).toBe(true)
    server = result(record.id); await flow.state.check()
    await flow.state.cancel()
    expect(readCheckoutRecovery()).toBeNull(); expect(flow.state.hasRecovery.value).toBe(false)
  })

  it('requires cancellation when same-mounted address inputs change, even at the same amount', async () => {
    const flow = mount(); await flow.state.initialize()
    const confirm = executor(flow, async () => { throw new Error('Declined') })
    await flow.state.pay(confirm, () => true)
    flow.payload.value.customer.address1 = '2 Example Street'
    await flow.state.pay(confirm, () => true)
    expect(api.create).toHaveBeenCalledOnce(); expect(flow.state.locked.value).toBe(true)
    expect(flow.state.message.value).toContain('Cancel the previous')
  })

  it('blocks SDK confirmation on frozen amount mismatch, including subsequent clicks', async () => {
    const flow = mount(); await flow.state.initialize()
    api.create.mockImplementationOnce(async payload => ({ clientSecret: 'offline-client-secret', pricing: { total: 20 }, result: result(payload.attemptId, 'OPEN', { amountCents: 2000 }) }))
    const sdkConfirm = vi.fn(), confirm = executor(flow, sdkConfirm)
    await flow.state.pay(confirm, () => true)
    expect(sdkConfirm).not.toHaveBeenCalled(); expect(flow.state.locked.value).toBe(true)
    await flow.state.pay(confirm, () => true)
    expect(api.create).toHaveBeenCalledOnce()
  })

  it('fails closed for foreign attempt responses without showing their PII', async () => {
    await persist(); api.get.mockResolvedValue(result(webcrypto.randomUUID(), 'COMPLETED', { customer: { email: 'private-owner@example.test' } }))
    const flow = mount(); await flow.state.initialize()
    expect(flow.state.attempt.value).toBeNull(); expect(flow.complete).not.toHaveBeenCalled()
    expect(flow.state.message.value).not.toContain('private-owner')
    expect(flow.state.locked.value).toBe(true)
  })

  it.each(['read', 'write'])('does not POST or confirm if recovery storage %s fails', async operation => {
    if (operation === 'read') localStorage.getItem.mockImplementation(() => { throw new Error('storage private detail') })
    const flow = mount(); await flow.state.initialize()
    if (operation === 'write') localStorage.setItem.mockImplementation(() => { throw new Error('Quota exceeded') })
    const sdkConfirm = vi.fn()
    await flow.state.pay(executor(flow, sdkConfirm), () => true)
    expect(api.create).not.toHaveBeenCalled(); expect(sdkConfirm).not.toHaveBeenCalled()
    expect(flow.state.blocked.value).toBe(true)
  })

  it('blocks when another tab replaces the recovery handle', async () => {
    await persist(); const flow = mount(); await flow.state.initialize()
    storageEvents.get('storage')({ key: CHECKOUT_RECOVERY_KEY })
    expect(flow.state.locked.value).toBe(true)
    await flow.state.pay(executor(flow), () => true)
    expect(api.create).not.toHaveBeenCalled()
  })

  it('keeps legacy checkout selected when recovery is explicitly off and no handle exists', async () => {
    api.configuration.mockResolvedValue({ recoveryEnabled: false })
    const flow = mount(); await flow.state.initialize()
    expect(flow.state.active.value).toBe(false); expect(flow.state.locked.value).toBe(false)
    expect(api.get).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled()
  })

  it('requires Web Locks for payment confirmation rather than relying on storage events', async () => {
    vi.stubGlobal('navigator', {})
    const flow = mount(); await flow.state.initialize()
    const confirm = executor(flow)
    expect(flow.state.locked.value).toBe(true)
    await flow.state.pay(confirm, () => true)
    expect(confirm).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled()
    expect(readCheckoutRecovery()).toBeNull()
    expect(flow.state.message.value).toContain('browser cannot safely start')
  })

  it('still recovers paid receipts without Web Locks', async () => {
    vi.stubGlobal('navigator', {})
    await persist('PAID_PENDING_ORDER')
    const flow = mount(); await flow.state.initialize(); await flow.state.check()
    expect(flow.complete).toHaveBeenCalledOnce(); expect(api.create).not.toHaveBeenCalled()
  })

  it('does not start confirmation when another tab holds the Web Lock', async () => {
    navigator.locks.request.mockImplementationOnce(async (_name, _options, callback) => callback(null))
    const flow = mount(); await flow.state.initialize()
    const confirm = executor(flow)
    await flow.state.pay(confirm, () => true)
    expect(confirm).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled()
    expect(flow.state.message.value).toContain('Another checkout tab')
  })

  it('does not fall back to unprotected legacy charging when public configuration fails', async () => {
    api.configuration.mockRejectedValueOnce(new Error('Unavailable'))
    const flow = mount(); await flow.state.initialize()
    expect(flow.state.active.value).toBe(true); expect(flow.state.locked.value).toBe(true)
    await flow.state.pay(executor(flow), () => true)
    expect(api.create).not.toHaveBeenCalled()
  })

  it('offers a second legitimate purchase only after explicit completed-state recheck', async () => {
    const old = await persist('COMPLETED'), flow = mount(); await flow.state.initialize()
    expect(flow.state.canStartNew.value).toBe(true); expect(flow.complete).not.toHaveBeenCalled()
    const confirm = executor(flow)
    await flow.state.pay(confirm, () => true)
    expect(confirm).not.toHaveBeenCalled()
    expect(await flow.state.startNew()).toBe(true)
    expect(api.get).toHaveBeenLastCalledWith(old)
    expect(getReceiptAccess('CE-OFFLINE')).toBe('offline-receipt')
    expect(readCheckoutRecovery()).toBeNull()
    await flow.state.pay(confirm, () => true)
    expect(api.create).toHaveBeenCalledOnce()
    expect(api.create.mock.calls[0][0].attemptId).not.toBe(old.id)
    expect(confirm).toHaveBeenCalledOnce()
  })

  it('does not release a completed handle when its canonical recheck fails', async () => {
    const old = await persist('COMPLETED'), flow = mount(); await flow.state.initialize()
    api.get.mockRejectedValueOnce(new Error('Unavailable'))
    expect(await flow.state.startNew()).toBe(false)
    expect(readCheckoutRecovery()).toEqual(old)
    expect(api.create).not.toHaveBeenCalled()
  })

  it('settles a canonically completed creation response without needing a client secret or SDK confirmation', async () => {
    const flow = mount(); await flow.state.initialize()
    api.create.mockImplementationOnce(async payload => ({ success: true, result: result(payload.attemptId, 'COMPLETED') }))
    const sdkConfirm = vi.fn()
    const execute = vi.fn(async () => {
      const prepared = await flow.state.preparePayment(flow.payload.value, flow.total.value)
      if (!prepared.recovered) sdkConfirm()
    })
    expect(await flow.state.pay(execute, () => true)).toBe(true)
    expect(sdkConfirm).not.toHaveBeenCalled(); expect(flow.complete).toHaveBeenCalledOnce()
    expect(api.get).not.toHaveBeenCalled()
  })

  it('does not reconcile or confirm again after completion navigation unmounts checkout', async () => {
    const flow = mount({ onComplete: async () => flow.unmount() }); await flow.state.initialize()
    api.create.mockImplementationOnce(async payload => ({ success: true, result: result(payload.attemptId, 'COMPLETED') }))
    const confirm = vi.fn(async () => {
      expect(await flow.state.preparePayment(flow.payload.value, flow.total.value)).toEqual({ recovered: true })
    })
    expect(await flow.state.pay(confirm, () => true)).toBe(true)
    expect(api.get).not.toHaveBeenCalled(); expect(api.create).toHaveBeenCalledOnce()
  })

  it('does not restore PII or navigate after unmount during status retrieval', async () => {
    const record = await persist(); let resolve
    api.get.mockReturnValueOnce(new Promise(done => { resolve = done }))
    const flow = mount(), pending = flow.state.initialize()
    await Promise.resolve(); await Promise.resolve()
    flow.unmount(); resolve(result(record.id, 'COMPLETED'))
    await pending
    expect(flow.state.attempt.value).toBeNull(); expect(flow.complete).not.toHaveBeenCalled()
  })
})

describe('bounded capability storage and matching bag cleanup', () => {
  it('hashes only cart identity/size/quantity and clears only a matching unchanged bag', async () => {
    const fingerprint = await cartFingerprint(items)
    saved.set('cart', JSON.stringify(items))
    expect(await clearRecoveredCart('cart', fingerprint)).toBe(true)
    saved.set('cart', JSON.stringify([{ ...items[0], quantity: 2 }]))
    expect(await clearRecoveredCart('cart', fingerprint)).toBe(false)
    expect(JSON.parse(saved.get('cart'))[0].quantity).toBe(2)
  })

  it('erases expired capability bytes after seven days but keeps a non-secret do-not-repay marker', async () => {
    const record = newCheckoutRecovery(await cartFingerprint(items), Date.now() - RECOVERY_LIFETIME_MS - 1)
    saveCheckoutRecovery(record)
    const flow = mount(); await flow.state.initialize()
    expect(readCheckoutRecovery().token).toBe(''); expect(flow.state.blocked.value).toBe(true)
    expect(saved.get(CHECKOUT_RECOVERY_KEY)).not.toContain(record.token)
    expect(api.get).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled()
  })
})
