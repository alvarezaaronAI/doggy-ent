import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mapCustomerOrder } from '../../../src/domains/orders/mappers/orders.mapper.js'
const repo = vi.hoisted(() => ({ findReceiptSettings: vi.fn(), saveReceiptSettings: vi.fn(), findQueuedReceipts: vi.fn(), claimQueuedReceipt: vi.fn() }))
const provider = vi.hoisted(() => ({ getEmailProviderStatus: vi.fn(), dispatchReservedCheckoutReceipt: vi.fn() }))
vi.mock('../../../src/domains/emails/repositories/checkoutReceipt.repository.js', () => repo)
vi.mock('../../../src/domains/emails/services/emailProvider.service.js', () => provider)
const { prepareCheckoutReceipt, updateCheckoutReceiptSettings, getCheckoutReceiptSettings } = await import('../../../src/domains/emails/services/checkoutReceipt.service.js')
const { drainCheckoutReceipts, startCheckoutReceiptWorker } = await import('../../../src/domains/emails/services/checkoutReceiptWorker.service.js')
const template = { id: 'template-1', event: 'ORDER_CONFIRMATION', revision: 3, subject: 'Payment {{orderReference}}', heading: 'Payment received', body: 'Thanks {{customerName}}.', footer: 'Shipping follows separately.' }
const settings = { mode: 'DRY_RUN', templateId: template.id, revision: 2, template }
const order = { orderNumber: 'CE-FIXTURE', status: 'PAID', stripePaymentIntentId: 'pi_fixture_private', customerEmail: 'guest@example.test', customerName: 'Alex', items: [{ productName: 'Chicken', size: '6 oz', quantity: 1, unitPrice: 14.99, lineTotal: 14.99 }], subtotal: 14.99, total: 21.99, currency: 'usd' }
beforeEach(() => {
  vi.clearAllMocks(); repo.findReceiptSettings.mockResolvedValue(settings); repo.saveReceiptSettings.mockResolvedValue(settings)
  provider.getEmailProviderStatus.mockReturnValue({ live: false }); repo.findQueuedReceipts.mockResolvedValue([]); repo.claimQueuedReceipt.mockResolvedValue(true)
})
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers() })
describe('automatic verified-payment receipt preparation', () => {
  it('defaults to disabled without creating a record', async () => {
    repo.findReceiptSettings.mockResolvedValue(null)
    expect(await getCheckoutReceiptSettings()).toMatchObject({ mode: 'DISABLED', revision: 0, liveAvailable: false })
    expect(await prepareCheckoutReceipt(order)).toBeNull()
  })
  it('requires paid verified order context and an active confirmation template', async () => {
    expect(await prepareCheckoutReceipt({ ...order, status: 'PENDING' })).toBeNull()
    expect(await prepareCheckoutReceipt({ ...order, stripePaymentIntentId: null })).toBeNull()
    for (const change of [{ archived: true }, { event: 'ORDER_SHIPPED' }]) {
      repo.findReceiptSettings.mockResolvedValue({ ...settings, template: { ...template, ...change } })
      expect(await prepareCheckoutReceipt(order)).toBeNull()
    }
    expect(provider.dispatchReservedCheckoutReceipt).not.toHaveBeenCalled()
  })
  it('freezes copy and trusted receipt facts with a permanent payment-level dedupe key', async () => {
    const receipt = await prepareCheckoutReceipt(order)
    expect(receipt).toMatchObject({ status: 'QUEUED', automatic: true, recipient: order.customerEmail, provider: 'MOCK', metadata: { source: 'VERIFIED_CHECKOUT', templateId: template.id, templateRevision: 3 } })
    expect(receipt.dedupeKey).toMatch(/^checkout-receipt:[a-f0-9]{64}$/)
    expect(receipt.renderedEmail.html).toContain('$21.99')
    expect(JSON.stringify(receipt)).not.toContain(order.stripePaymentIntentId)
    expect((await prepareCheckoutReceipt({ ...order, total: 22 })).dedupeKey).toBe(receipt.dedupeKey)
    expect(provider.dispatchReservedCheckoutReceipt).not.toHaveBeenCalled()
  })
  it('validates settings, separates test/live, and binds saves to the admin actor', async () => {
    for (const value of [{ mode: 'LIVE', revision: 0, templateId: template.id }, { mode: 'DRY_RUN', revision: 0, templateId: null }, { mode: 'DRY_RUN', revision: '0', templateId: template.id }, { mode: 'DRY_RUN', revision: 0, templateId: template.id, to: 'other@example.test' }]) await expect(updateCheckoutReceiptSettings(value, 'admin-1')).rejects.toMatchObject({ statusCode: 400 })
    expect(repo.saveReceiptSettings).not.toHaveBeenCalled()
    await updateCheckoutReceiptSettings({ mode: 'DRY_RUN', revision: 0, templateId: template.id }, 'admin-1')
    expect(repo.saveReceiptSettings).toHaveBeenCalledWith({ mode: 'DRY_RUN', revision: 0, templateId: template.id }, 'admin-1')
    vi.stubEnv('CHECKOUT_RECEIPT_SEND_ENABLED', 'true'); provider.getEmailProviderStatus.mockReturnValue({ live: true })
    await updateCheckoutReceiptSettings({ mode: 'LIVE', revision: 2, templateId: template.id }, 'admin-1')
    expect(repo.saveReceiptSettings).toHaveBeenLastCalledWith({ mode: 'LIVE', revision: 2, templateId: template.id }, 'admin-1')
  })
})
describe('bounded receipt dispatcher', () => {
  it('does not inspect or send old orders and stops when disabled', async () => {
    repo.findReceiptSettings.mockResolvedValue({ mode: 'DISABLED' }); await drainCheckoutReceipts()
    expect(repo.findQueuedReceipts).not.toHaveBeenCalled()
  })
  it('never converts test records to live and never dispatches a lost atomic claim', async () => {
    repo.findQueuedReceipts.mockResolvedValue([{ id: 'dry', provider: 'MOCK' }, { id: 'live', provider: 'RESEND' }])
    repo.claimQueuedReceipt.mockResolvedValue(false); await drainCheckoutReceipts()
    expect(repo.claimQueuedReceipt).toHaveBeenCalledTimes(1); expect(provider.dispatchReservedCheckoutReceipt).not.toHaveBeenCalled()
    repo.claimQueuedReceipt.mockResolvedValue(true); await drainCheckoutReceipts()
    expect(provider.dispatchReservedCheckoutReceipt).toHaveBeenCalledExactlyOnceWith({ id: 'dry', provider: 'MOCK' })
  })
  it('requires both saved live mode and the provider/server gate before live claiming', async () => {
    repo.findReceiptSettings.mockResolvedValue({ mode: 'LIVE' }); repo.findQueuedReceipts.mockResolvedValue([{ id: 'live', provider: 'RESEND' }])
    provider.getEmailProviderStatus.mockReturnValue({ live: true }); await drainCheckoutReceipts()
    expect(repo.claimQueuedReceipt).not.toHaveBeenCalled()
    vi.stubEnv('CHECKOUT_RECEIPT_SEND_ENABLED', 'true'); await drainCheckoutReceipts()
    expect(provider.dispatchReservedCheckoutReceipt).toHaveBeenCalledExactlyOnceWith({ id: 'live', provider: 'RESEND' })
  })
  it('does not overlap timer runs and supports clean shutdown', async () => {
    vi.useFakeTimers(); let resolve
    repo.findReceiptSettings.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    const stop = startCheckoutReceiptWorker({ intervalMs: 1000 })
    await vi.advanceTimersByTimeAsync(3000); expect(repo.findReceiptSettings).toHaveBeenCalledOnce()
    resolve({ mode: 'DISABLED' }); await vi.advanceTimersByTimeAsync(1000)
    expect(repo.findReceiptSettings).toHaveBeenCalledTimes(2); stop(); await vi.advanceTimersByTimeAsync(2000)
    expect(repo.findReceiptSettings).toHaveBeenCalledTimes(2)
  })
})
describe('customer receipt projection', () => {
  it.each(['QUEUED', 'PENDING', 'FAILED', 'MOCKED', 'SENT'])('reports %s without exposing queue payload or metadata', status => {
    const mapped = mapCustomerOrder({ ...order, emailDeliveries: [{ event: 'ORDER_CONFIRMATION', status, renderedEmail: { html: 'PRIVATE_PAYLOAD' }, metadata: { secret: 'PRIVATE_METADATA' } }] })
    expect(mapped.receiptEmailStatus).toBe(status)
    expect(JSON.stringify(mapped)).not.toContain('PRIVATE_')
  })
  it('keeps provider acceptance authoritative over later tests/failures', () => {
    expect(mapCustomerOrder({ ...order, emailDeliveries: [{ event: 'ORDER_CONFIRMATION', status: 'SENT' }, { event: 'ORDER_CONFIRMATION', status: 'MOCKED' }] }).receiptEmailStatus).toBe('SENT')
  })
})
