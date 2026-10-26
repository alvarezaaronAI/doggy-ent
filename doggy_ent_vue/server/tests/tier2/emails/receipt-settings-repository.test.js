import { beforeEach, describe, expect, it, vi } from 'vitest'
const tx = vi.hoisted(() => ({ emailTemplate: { findFirst: vi.fn() }, checkoutReceiptSettings: { create: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() } }))
const db = vi.hoisted(() => ({ $transaction: vi.fn(), emailDelivery: { findMany: vi.fn(), updateMany: vi.fn() } }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
const { saveReceiptSettings, findQueuedReceipts, claimQueuedReceipt } = await import('../../../src/domains/emails/repositories/checkoutReceipt.repository.js')
beforeEach(() => { vi.clearAllMocks(); db.$transaction.mockImplementation(action => action(tx)); tx.emailTemplate.findFirst.mockResolvedValue({ id: 'template-1' }); tx.checkoutReceiptSettings.updateMany.mockResolvedValue({ count: 1 }); db.emailDelivery.updateMany.mockResolvedValue({ count: 1 }) })
describe('receipt settings and outbox persistence boundary', () => {
  it('validates an active saved confirmation template within the settings transaction', async () => {
    await saveReceiptSettings({ mode: 'DRY_RUN', templateId: 'template-1', revision: 0 }, 'admin-1')
    expect(tx.emailTemplate.findFirst).toHaveBeenCalledWith({ where: { id: 'template-1', archived: false, event: 'ORDER_CONFIRMATION' } })
    expect(tx.checkoutReceiptSettings.create).toHaveBeenCalledWith({ data: { id: 'checkout-payment-receipt', mode: 'DRY_RUN', templateId: 'template-1', updatedBy: 'admin-1' } })
    tx.emailTemplate.findFirst.mockResolvedValue(null)
    await expect(saveReceiptSettings({ mode: 'LIVE', templateId: 'missing', revision: 0 }, 'admin-1')).rejects.toMatchObject({ statusCode: 400 })
  })
  it('rejects concurrent create and stale revisions without overwriting settings', async () => {
    tx.checkoutReceiptSettings.create.mockRejectedValue({ code: 'P2002' })
    await expect(saveReceiptSettings({ mode: 'DISABLED', templateId: null, revision: 0 }, 'admin-1')).rejects.toMatchObject({ statusCode: 409 })
    tx.checkoutReceiptSettings.updateMany.mockResolvedValue({ count: 0 })
    await expect(saveReceiptSettings({ mode: 'DISABLED', templateId: null, revision: 4 }, 'admin-1')).rejects.toMatchObject({ statusCode: 409 })
    expect(tx.checkoutReceiptSettings.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'checkout-payment-receipt', revision: 4 } }))
  })
  it('uses a bounded, provider-filtered queue and compare-and-set claim', async () => {
    await findQueuedReceipts()
    expect(db.emailDelivery.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5, where: expect.objectContaining({ status: 'QUEUED', automatic: true, provider: { in: ['MOCK'] } }) }))
    expect(await claimQueuedReceipt('job-1')).toBe(true)
    expect(db.emailDelivery.updateMany).toHaveBeenCalledWith({ where: { id: 'job-1', automatic: true, event: 'ORDER_CONFIRMATION', status: 'QUEUED' }, data: { status: 'PENDING' } })
    db.emailDelivery.updateMany.mockResolvedValue({ count: 0 }); expect(await claimQueuedReceipt('job-1')).toBe(false)
  })
})
