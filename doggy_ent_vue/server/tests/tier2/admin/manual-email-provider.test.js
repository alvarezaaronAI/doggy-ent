import { beforeEach, describe, expect, it, vi } from 'vitest'
const repo = vi.hoisted(() => ({ createEmailDelivery: vi.fn(), findEmailDeliveryByDedupeKey: vi.fn(), updateEmailDeliveryById: vi.fn() }))
vi.mock('../../../src/domains/emails/repositories/emailDelivery.repository.js', () => repo)
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { customerNotificationPreference: { findUnique: vi.fn().mockResolvedValue(null) } } }))
const { queueEmail } = await import('../../../src/domains/emails/services/emailProvider.service.js')
beforeEach(() => { vi.clearAllMocks(); repo.findEmailDeliveryByDedupeKey.mockResolvedValue(null); repo.createEmailDelivery.mockImplementation(async data => ({ ...data, id: 'email-1' })) })
describe('manual-first provider dispatch', () => {
  it('blocks automatic operational events before any persistence or provider request', async () => {
    for (const event of ['ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'TRACKING_UPDATE', 'ADMIN_NEW_ORDER', 'REFUND_ISSUED', 'SUPPORT_REQUEST', 'REVIEW_REQUEST']) expect((await queueEmail({ event, to: 'qa@example.com' })).status).toBe('SKIPPED')
    expect(repo.createEmailDelivery).not.toHaveBeenCalled()
  })
  it('records approved dry runs without calling the provider', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
    try {
      const result = await queueEmail({ event: 'ORDER_CONFIRMATION', to: 'qa@example.com', manualApproved: true, dryRun: true, renderedEmail: { subject: 'Receipt', html: '<p>Receipt</p>', text: 'Receipt' }, dedupeKey: 'qa-dry' })
      expect(result.status).toBe('MOCKED'); expect(fetch).not.toHaveBeenCalled(); expect(repo.createEmailDelivery).toHaveBeenCalledWith(expect.objectContaining({ status: 'MOCKED', provider: 'MOCK' }))
    } finally { vi.unstubAllGlobals() }
  })
  it('handles a simultaneous unique reservation conflict as duplicate without dispatch', async () => {
    repo.createEmailDelivery.mockRejectedValue({ code: 'P2002' })
    const result = await queueEmail({ event: 'ORDER_CONFIRMATION', to: 'qa@example.com', manualApproved: true, dryRun: true, renderedEmail: { subject: 'Receipt', html: '<p>Receipt</p>', text: 'Receipt' }, dedupeKey: 'same-preview' })
    expect(result.status).toBe('DUPLICATE'); expect(repo.updateEmailDeliveryById).not.toHaveBeenCalled()
  })
  it('never stores or logs provider-returned action links, recipient details or secret text', async () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('EMAIL_PROVIDER', 'RESEND'); vi.stubEnv('RESEND_API_KEY', 'fixture-key'); vi.stubEnv('RESEND_FROM_EMAIL', 'sender@example.test')
    const fetch = vi.fn().mockResolvedValue(Response.json({ message: 'private-recipient@example.test https://example.test/reset?token=private-proof fixture-key' }, { status: 400 }))
    vi.stubGlobal('fetch', fetch)
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const result = await queueEmail({ event: 'ORDER_CONFIRMATION', to: 'qa@example.test', manualApproved: true, renderedEmail: { subject: 'Receipt', html: '<p>Receipt</p>', text: 'Receipt' }, dedupeKey: 'fixture-failure' })
      expect(result.status).toBe('FAILED'); expect(result.reason).toContain('(400)')
      const stored = JSON.stringify(repo.updateEmailDeliveryById.mock.calls), logged = JSON.stringify(log.mock.calls)
      for (const secret of ['private-recipient', 'private-proof', 'fixture-key']) { expect(stored).not.toContain(secret); expect(logged).not.toContain(secret) }
      expect(fetch).toHaveBeenCalledOnce()
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs(); log.mockRestore() }
  })
})
