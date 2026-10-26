import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_EMAIL_SUGGESTIONS } from '../../../src/domains/emails/constants/orderEmailTemplates.constants.js'
import { validateEmailTemplate } from '../../../src/domains/emails/validators/emailTemplate.validator.js'
const table = vi.hoisted(() => ({ findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { emailTemplate: table } }))
vi.mock('../../../src/domains/emails/services/checkoutReceipt.service.js', () => ({ getCheckoutReceiptSettings: async () => ({ mode: 'DISABLED' }) }))
vi.mock('../../../src/domains/emails/services/emailProvider.service.js', () => ({ getEmailProviderStatus: () => ({ live: false }), queueEmail: vi.fn() }))
const { findStarterEmailTemplate, useStarterEmailTemplate } = await import('../../../src/domains/emails/repositories/emailTemplate.repository.js')
const { getEmailTemplates } = await import('../../../src/domains/emails/services/emailTemplate.service.js')
const suggestion = ORDER_EMAIL_SUGGESTIONS[0], data = validateEmailTemplate(suggestion)
const id = `starter-copy-${suggestion.id}`
beforeEach(() => { vi.resetAllMocks(); table.findUnique.mockResolvedValue(null); table.findFirst.mockResolvedValue(null) })
describe('one saved copy per starter without overwriting existing content', () => {
  it('reserves a deterministic primary key rather than generating a new id for every click', async () => {
    table.create.mockImplementation(async ({ data }) => ({ ...data, revision: 1 }))
    expect(await useStarterEmailTemplate(suggestion, data)).toMatchObject({ id, copyReused: false })
    expect(table.create).toHaveBeenCalledWith({ data: { ...data, id } })
  })
  it('reuses a customized canonical copy without changing its name, event, revision or archive flag', async () => {
    const saved = { id, name: 'My holiday receipt', event: 'ORDER_SHIPPED', archived: true, revision: 8, body: 'Saved wording' }
    table.findUnique.mockResolvedValue(saved)
    expect(await useStarterEmailTemplate(suggestion, data)).toEqual({ ...saved, copyReused: true })
    expect(table.create).not.toHaveBeenCalled(); expect(table.findFirst).not.toHaveBeenCalled()
  })
  it('reuses an older same-type saved template, preferring active then oldest, even after renaming', async () => {
    const saved = { ...data, id: 'legacy-cuid', name: 'Our custom confirmation', body: 'Our own wording', revision: 3 }
    table.findFirst.mockResolvedValue(saved)
    expect(await useStarterEmailTemplate(suggestion, data)).toEqual({ ...saved, copyReused: true })
    expect(table.findFirst).toHaveBeenCalledWith({ where: { event: suggestion.event }, orderBy: [{ archived: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }] })
    expect(table.create).not.toHaveBeenCalled()
  })
  it('returns the winning saved copy after a concurrent unique-key collision', async () => {
    table.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...data, id, revision: 1 })
    table.create.mockRejectedValue({ code: 'P2002' })
    expect(await useStarterEmailTemplate(suggestion, data)).toMatchObject({ id, copyReused: true })
    expect(table.create).toHaveBeenCalledTimes(1)
  })
  it('does not swallow other database errors or an unexplained unique conflict', async () => {
    table.create.mockRejectedValue(new Error('fixture unavailable'))
    await expect(useStarterEmailTemplate(suggestion, data)).rejects.toThrow('fixture unavailable')
    table.create.mockRejectedValue({ code: 'P2002' })
    await expect(useStarterEmailTemplate(suggestion, data)).rejects.toMatchObject({ code: 'P2002' })
  })
  it('returns no invented copy when neither a reserved nor older same-type template exists', async () => {
    expect(await findStarterEmailTemplate(suggestion)).toBeNull()
    expect(table.create).not.toHaveBeenCalled()
  })
  it('links starters to their existing copies without mutating rows or duplicating the list', async () => {
    const saved = { ...data, id, revision: 4 }
    table.findMany.mockResolvedValue([saved])
    table.findUnique.mockImplementation(async ({ where }) => where.id === id ? saved : null)
    const result = await getEmailTemplates()
    expect(result.templates.find(item => item.id === suggestion.id).editableCopyId).toBe(id)
    expect(result.templates.filter(item => item.id === id)).toHaveLength(1)
    expect(table.create).not.toHaveBeenCalled()
  })
  it('includes a linked copy outside the ordinary list page so Open never recreates it', async () => {
    const saved = { ...data, id, archived: true }
    table.findMany.mockResolvedValue([])
    table.findUnique.mockImplementation(async ({ where }) => where.id === id ? saved : null)
    const result = await getEmailTemplates()
    expect(result.templates).toContainEqual({ ...saved, sourceSuggestionId: suggestion.id })
    expect(result.templates.find(item => item.id === suggestion.id).editableCopyId).toBe(id)
    expect(table.create).not.toHaveBeenCalled()
  })
})
