import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
const repo = vi.hoisted(() => ({ createEmailDelivery: vi.fn(), findEmailDeliveryByDedupeKey: vi.fn(), updateEmailDeliveryById: vi.fn() }))
vi.mock('../../../src/domains/emails/repositories/emailDelivery.repository.js', () => repo)
vi.mock('../../../src/db/prisma.js', () => ({ prisma: {} }))
const { dispatchReservedCheckoutReceipt, queueEmail } = await import('../../../src/domains/emails/services/emailProvider.service.js')
const delivery = { id: 'email-1', automatic: true, event: 'ORDER_CONFIRMATION', metadata: { source: 'VERIFIED_CHECKOUT' }, recipient: 'qa@example.test', dedupeKey: 'checkout-receipt:fixture', provider: 'RESEND', renderedEmail: { subject: 'Payment received', html: '<p>Paid</p>', text: 'Paid' } }
let fetchMock
beforeEach(() => {
  vi.clearAllMocks(); repo.updateEmailDeliveryById.mockResolvedValue({}); fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'provider-fixture' })); vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('EMAIL_PROVIDER', 'RESEND'); vi.stubEnv('RESEND_API_KEY', 'synthetic-key'); vi.stubEnv('RESEND_FROM_EMAIL', 'sender@example.test'); vi.stubEnv('CHECKOUT_RECEIPT_SEND_ENABLED', 'true')
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks() })
describe('reserved automatic receipt provider boundary', () => {
  it('does not relax the manual gate for any generic operational call', async () => {
    expect((await queueEmail({ event: 'ORDER_CONFIRMATION', to: delivery.recipient, automatic: true, verifiedCheckout: true })).status).toBe('SKIPPED')
    await dispatchReservedCheckoutReceipt({ ...delivery, event: 'ORDER_SHIPPED' })
    await dispatchReservedCheckoutReceipt({ ...delivery, automatic: false })
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('records dry runs without network use or a false sent timestamp', async () => {
    await dispatchReservedCheckoutReceipt({ ...delivery, provider: 'MOCK' })
    expect(fetchMock).not.toHaveBeenCalled(); expect(repo.updateEmailDeliveryById).toHaveBeenCalledWith(delivery.id, { status: 'MOCKED', renderedEmail: null })
  })
  it('returns a claimed job to the queue if live sending is disabled', async () => {
    vi.stubEnv('CHECKOUT_RECEIPT_SEND_ENABLED', 'false'); await dispatchReservedCheckoutReceipt(delivery)
    expect(fetchMock).not.toHaveBeenCalled(); expect(repo.updateEmailDeliveryById).toHaveBeenCalledWith(delivery.id, { status: 'QUEUED' })
  })
  it('sends frozen content to the order recipient with provider dedupe then minimizes the payload', async () => {
    await dispatchReservedCheckoutReceipt(delivery)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails'); expect(options.headers['Idempotency-Key']).toBe(delivery.dedupeKey)
    expect(JSON.parse(options.body)).toMatchObject({ ...delivery.renderedEmail, to: [delivery.recipient] })
    expect(repo.updateEmailDeliveryById).toHaveBeenCalledWith(delivery.id, expect.objectContaining({ status: 'SENT', providerId: 'provider-fixture', renderedEmail: null, sentAt: expect.any(Date) }))
  })
  it('never retries an ambiguous timeout or stores/logs raw provider errors', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('PRIVATE_RECIPIENT synthetic-key PRIVATE_TOKEN'))
    await dispatchReservedCheckoutReceipt(delivery)
    expect(fetchMock).toHaveBeenCalledOnce()
    const serialized = JSON.stringify([repo.updateEmailDeliveryById.mock.calls, log.mock.calls])
    expect(serialized).not.toMatch(/PRIVATE_|synthetic-key/)
    expect(repo.updateEmailDeliveryById).toHaveBeenCalledWith(delivery.id, expect.objectContaining({ status: 'FAILED', renderedEmail: null }))
  })
  it('leaves uncertain acceptance and failed status writes pending rather than sending again', async () => {
    fetchMock.mockResolvedValue(Response.json({})); await dispatchReservedCheckoutReceipt(delivery)
    expect(repo.updateEmailDeliveryById).toHaveBeenCalledWith(delivery.id, { errorMessage: expect.stringContaining('uncertain') })
    expect(fetchMock).toHaveBeenCalledOnce()
    vi.clearAllMocks(); fetchMock.mockResolvedValue(Response.json({ id: 'accepted' })); repo.updateEmailDeliveryById.mockRejectedValue(new Error('DB unavailable'))
    await expect(dispatchReservedCheckoutReceipt(delivery)).rejects.toThrow('DB unavailable')
    expect(fetchMock).toHaveBeenCalledOnce(); expect(repo.updateEmailDeliveryById).toHaveBeenCalledOnce()
  })
})
