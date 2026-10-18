import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'
const api = vi.hoisted(() => ({ fetchWebsiteDraft: vi.fn(), saveWebsiteDraft: vi.fn() }))
vi.mock('../../../src/domains/admin/api/adminWebsite.api.js', () => api)
vi.mock('vue-router', async original => ({ ...(await original()), onBeforeRouteLeave: () => {} }))
const { useAdminWebsite } = await import('../../../src/domains/admin/composables/useAdminWebsite.js')
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal('window', { confirm: vi.fn(() => true) }); api.fetchWebsiteDraft.mockResolvedValue({ draft: createDefaultStorefrontContent(), revision: 0, published: null, publishedAt: null }) })
describe('website editor explicit drafts', () => {
  it('loads without writes and cancels local edits without a request', async () => {
    const editor = useAdminWebsite(); await editor.load()
    editor.draft.value.header.brandName = 'Unsaved name'
    await nextTick(); expect(editor.dirty.value).toBe(true)
    expect(editor.changedSections.value).toEqual(['header'])
    editor.cancel(); expect(editor.dirty.value).toBe(false)
    expect(editor.changedSections.value).toEqual([])
    expect(api.saveWebsiteDraft).not.toHaveBeenCalled()
  })
  it('adds, reorders, hides and removes supported sections in the draft only', async () => {
    const editor = useAdminWebsite(); await editor.load()
    editor.addSection('banner'); const id = editor.selected.value
    expect(editor.selectedBlock.value.type).toBe('banner')
    editor.moveSection(id, -1)
    expect(editor.draft.value.sections.at(-2).id).toBe(id)
    editor.selectedBlock.value.visible = false
    editor.removeSection(id)
    expect(editor.draft.value.sections).toHaveLength(11)
    editor.addSection('hero')
    expect(editor.draft.value.sections).toHaveLength(11)
    expect(api.saveWebsiteDraft).not.toHaveBeenCalled()
  })
  it('retains drafts on failed saves and conflict errors', async () => {
    const editor = useAdminWebsite(); await editor.load()
    editor.draft.value.header.brandName = 'Retained draft'
    api.saveWebsiteDraft.mockRejectedValue(new Error('Changed in another editor'))
    await editor.save()
    expect(editor.error.value).toContain('another editor')
    expect(editor.draft.value.header.brandName).toBe('Retained draft')
    expect(editor.dirty.value).toBe(true)
    expect(editor.busy.value).toBe(false)
  })
  it('separates Save draft and explicitly confirmed Publish', async () => {
    const editor = useAdminWebsite(); await editor.load()
    editor.draft.value.header.brandName = 'Saved name'
    api.saveWebsiteDraft.mockImplementation(async (content, revision, publish) => ({ draft: content, revision: revision + 1, published: publish ? content : null, publishedAt: publish ? '2026-10-09T00:00:00Z' : null }))
    await editor.save(false)
    expect(api.saveWebsiteDraft).toHaveBeenLastCalledWith(expect.objectContaining({ header: expect.objectContaining({ brandName: 'Saved name' }) }), 0, false)
    expect(editor.dirty.value).toBe(false)
    expect(editor.hasUnpublishedChanges.value).toBe(true)
    window.confirm.mockReturnValueOnce(false); await editor.save(true)
    expect(api.saveWebsiteDraft).toHaveBeenCalledTimes(1)
    await editor.save(true)
    expect(api.saveWebsiteDraft).toHaveBeenLastCalledWith(expect.any(Object), 1, true)
    expect(editor.hasUnpublishedChanges.value).toBe(false)
  })
})
