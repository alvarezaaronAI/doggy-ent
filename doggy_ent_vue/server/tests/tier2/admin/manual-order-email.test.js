import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_EMAIL_SUGGESTIONS } from '../../../src/domains/emails/constants/orderEmailTemplates.constants.js'
import { validateEmailTemplate } from '../../../src/domains/emails/validators/emailTemplate.validator.js'
import { renderOrderEmail } from '../../../src/domains/emails/mappers/orderEmail.mapper.js'
const repo = vi.hoisted(() => ({ listEmailTemplates: vi.fn(), findEmailTemplate: vi.fn(), findStarterEmailTemplate: vi.fn(), useStarterEmailTemplate: vi.fn(), starterCopyId: id => `starter-copy-${id}`, updateEmailTemplate: vi.fn() }))
const orders = vi.hoisted(() => ({ findOrderById: vi.fn() }))
const provider = vi.hoisted(() => ({ queueEmail: vi.fn(), getEmailProviderStatus: vi.fn() }))
vi.mock('../../../src/domains/emails/repositories/emailTemplate.repository.js', () => repo)
vi.mock('../../../src/domains/orders/repositories/orders.repository.js', () => orders)
vi.mock('../../../src/domains/emails/services/emailProvider.service.js', () => provider)
const { previewEmailTemplate, sendEmailTemplate, saveEmailTemplate, sampleEmailOrder } = await import('../../../src/domains/emails/services/emailTemplate.service.js')
const template = ORDER_EMAIL_SUGGESTIONS[0]
beforeEach(() => { vi.clearAllMocks(); provider.getEmailProviderStatus.mockReturnValue({ live: false, mode: 'DRY_RUN' }); orders.findOrderById.mockResolvedValue({ ...sampleEmailOrder, id: 'order-1', status: 'PAID', updatedAt: 'v1' }); provider.queueEmail.mockResolvedValue({ status: 'MOCKED' }) })
describe('manual order templates and preview-before-send', () => {
  it('validates all suggested templates and rejects HTML, unknown/broken placeholders and subject newlines', () => {
    for (const item of ORDER_EMAIL_SUGGESTIONS) expect(validateEmailTemplate(item).event).toBe(item.event)
    for (const change of [{ body: '<script>bad</script>' }, { body: '{{secret}}' }, { body: '{{customerName}} }}' }, { subject: 'Header\r\nInjected' }, { archived: 'true' }]) expect(() => validateEmailTemplate({ ...template, ...change })).toThrow()
  })
  it('renders escaped real order items/totals, safe tracking and no private payment IDs', () => {
    const rendered = renderOrderEmail(template, { ...sampleEmailOrder, customerName: '<script>name</script>', stripePaymentIntentId: 'private-canary', shipment: { trackingNumber: 'ABC', trackingUrl: 'javascript:alert(1)' } })
    expect(rendered.html).toContain('&lt;script&gt;'); expect(rendered.html).toContain('18 oz'); expect(rendered.html).toContain('$32.24')
    for (const value of ['private-canary', '<script>', 'javascript:', '{{customerName}}']) expect(rendered.html).not.toContain(value)
    expect(rendered.text).toContain('CE-SAMPLE')
  })
  it('puts business-funded giving below the bill in HTML and text without extra charges', () => {
    const rendered = renderOrderEmail(template, { ...sampleEmailOrder, donationAmount: 4, campaignAttributions: [{ donationTarget: '<Rescue>' }] })
    expect(rendered.html.indexOf('Thank you for sharing')).toBeGreaterThan(rendered.html.indexOf('$32.24'))
    expect(rendered.html).toContain('supports &lt;Rescue&gt; at no extra cost to you')
    expect(rendered.text).toContain('not added to your bill'); expect(rendered.text).toContain('$4.00')
    expect(rendered.html).not.toContain('purchase generated')
    expect(renderOrderEmail(template, { ...sampleEmailOrder, donationAmount: 0 }).html).not.toContain('Thank you for sharing')
  })
  it('previewing a sample or unsaved draft cannot create a send proof or dispatch email', async () => {
    expect((await previewEmailTemplate(template.id)).previewProof).toBeNull()
    expect((await previewEmailTemplate(template.id, { orderId: 'order-1', draft: template })).previewProof).toBeNull()
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
  it.each([
    ['suggested-received', false, 'paid'], ['suggested-preparing', false, 'processing'],
    ['suggested-shipped', true, 'shipped'], ['suggested-delivered', true, 'delivered'], ['suggested-cancelled', false, 'cancelled'],
  ])('uses a matching fictional order state and tracking for %s', async (id, hasTracking, expectedStatus) => {
    const preview = await previewEmailTemplate(id)
    expect(preview.sample).toBe(true)
    expect(preview.html.includes('Delivery tracking')).toBe(hasTracking)
    expect(preview.html.includes('SAMPLE-TRACKING')).toBe(hasTracking)
    expect(preview.previewProof).toBeNull()
    const draft = { ...ORDER_EMAIL_SUGGESTIONS.find(item => item.id === id), body: 'Saved order status: {{orderStatus}}' }
    expect((await previewEmailTemplate(id, { draft })).text).toContain('Saved order status: ' + expectedStatus)
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
  it('requires a matching saved order state and tracking for shipped mail', async () => {
    await expect(previewEmailTemplate('suggested-shipped', { orderId: 'order-1' })).rejects.toThrow('status')
    orders.findOrderById.mockResolvedValue({ ...sampleEmailOrder, id: 'order-1', shipment: null })
    await expect(previewEmailTemplate('suggested-shipped', { orderId: 'order-1' })).rejects.toThrow('tracking')
  })
  it('requires explicit confirmation and binds the preview to the current admin', async () => {
    const preview = await previewEmailTemplate(template.id, { orderId: 'order-1' }, 'admin@example.test')
    await expect(sendEmailTemplate(template.id, { previewProof: preview.previewProof, dryRun: true }, 'admin@example.test')).rejects.toThrow('confirm')
    await expect(sendEmailTemplate(template.id, { previewProof: preview.previewProof, dryRun: true, confirmed: true }, 'other@example.test')).rejects.toThrow('preview')
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
  it('rejects changed order details and disabled live providers before sending', async () => {
    const preview = await previewEmailTemplate(template.id, { orderId: 'order-1' }, 'admin')
    await expect(sendEmailTemplate(template.id, { previewProof: preview.previewProof, dryRun: false, confirmed: true }, 'admin')).rejects.toThrow('disabled')
    orders.findOrderById.mockResolvedValue({ ...sampleEmailOrder, id: 'order-1', status: 'PAID', updatedAt: 'v2', total: 100 })
    await expect(sendEmailTemplate(template.id, { previewProof: preview.previewProof, dryRun: true, confirmed: true }, 'admin')).rejects.toThrow('changed')
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
  it('dispatches only the approved saved order recipient and records explicit dry run and actor', async () => {
    const preview = await previewEmailTemplate(template.id, { orderId: 'order-1' }, 'admin')
    const result = await sendEmailTemplate(template.id, { previewProof: preview.previewProof, dryRun: true, confirmed: true, recipient: 'attacker@example.test' }, 'admin')
    expect(result.message).toContain('No email was sent')
    expect(provider.queueEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'alex@example.com', manualApproved: true, dryRun: true, dedupeKey: expect.stringContaining('manual:dry:'), auditMetadata: expect.objectContaining({ actorType: 'ADMIN', actor: 'admin' }) }))
  })
  it('rejects stale template revisions rather than losing editor work', async () => {
    repo.updateEmailTemplate.mockResolvedValue(null)
    await expect(saveEmailTemplate('saved-1', { ...template, revision: 1 })).rejects.toMatchObject({ statusCode: 409 })
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
  it('adopts only a known starter through the idempotent repository path', async () => {
    repo.useStarterEmailTemplate.mockResolvedValue({ id: 'saved-1', copyReused: true })
    expect(await saveEmailTemplate(null, template)).toMatchObject({ id: 'saved-1', copyReused: true })
    expect(repo.useStarterEmailTemplate).toHaveBeenCalledWith(template, validateEmailTemplate(template))
    await expect(saveEmailTemplate(null, { ...template, id: 'unknown' })).rejects.toMatchObject({ statusCode: 400 })
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
  it('returns server-owned starter origin on both canonical creation and later edits', async () => {
    const saved = { ...validateEmailTemplate(template), id: `starter-copy-${template.id}`, revision: 1 }
    repo.useStarterEmailTemplate.mockResolvedValue(saved)
    expect(await saveEmailTemplate(null, template)).toMatchObject({ sourceSuggestionId: template.id })
    repo.updateEmailTemplate.mockResolvedValue({ ...saved, event: 'ORDER_SHIPPED', revision: 2 })
    expect(await saveEmailTemplate(saved.id, { ...saved, event: 'ORDER_SHIPPED' })).toMatchObject({ sourceSuggestionId: template.id, revision: 2 })
    expect(provider.queueEmail).not.toHaveBeenCalled()
  })
})
