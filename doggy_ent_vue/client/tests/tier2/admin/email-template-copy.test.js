import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, nextTick } from 'vue'
const api = vi.hoisted(() => ({ fetchEmailTemplates: vi.fn(), previewEmailTemplate: vi.fn(), saveEmailTemplate: vi.fn() }))
vi.mock('../../../src/domains/admin/api/adminEmailTemplates.api.js', () => api)
vi.mock('vue-router', () => ({ onBeforeRouteLeave: vi.fn() }))
import { useAdminEmailTemplates } from '../../../src/domains/admin/composables/useAdminEmailTemplates.js'
const starter = { id: 'suggested-received', name: 'Payment confirmation', event: 'ORDER_CONFIRMATION', suggested: true, heading: 'Thank you', revision: 0 }
const saved = { id: 'saved-fixture', name: 'My payment receipt', event: 'ORDER_CONFIRMATION', heading: 'My saved wording', archived: false, revision: 1 }
const apps = []
function mount() {
  let state
  const renderer = createRenderer({ createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {} })
  const app = renderer.createApp({ setup() { state = useAdminEmailTemplates(); return () => null } })
  app.mount({}); apps.push(app)
  return state
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await nextTick() }
beforeEach(() => {
  vi.resetAllMocks(); vi.useFakeTimers()
  vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn(), confirm: vi.fn(() => true) })
  api.fetchEmailTemplates.mockResolvedValue({ templates: [starter], provider: { live: false }, checkoutReceipt: { mode: 'DISABLED' } })
  api.previewEmailTemplate.mockResolvedValue({ sample: true })
})
describe('starter link reconciliation', () => {
  it('reconciles legacy starter links immediately after changing the saved email type', async () => {
    api.fetchEmailTemplates.mockResolvedValue({ templates: [saved, { ...starter, editableCopyId: saved.id }] })
    const state = mount(); await flush()
    state.draft.value.event = 'ORDER_SHIPPED'
    api.saveEmailTemplate.mockResolvedValue({ ...saved, event: 'ORDER_SHIPPED', revision: 2, sourceSuggestionId: null })
    await state.save()
    state.select(state.starters.value[0])
    expect(state.draft.value.id).toBe(starter.id)
    expect(api.fetchEmailTemplates).toHaveBeenCalledTimes(1)
  })
  it('preserves a reserved starter origin after renaming or changing its email type', async () => {
    api.fetchEmailTemplates.mockResolvedValue({ templates: [saved, starter] })
    const state = mount(); await flush()
    state.draft.value.event = 'ORDER_SHIPPED'
    api.saveEmailTemplate.mockResolvedValue({ ...saved, event: 'ORDER_SHIPPED', revision: 2, sourceSuggestionId: starter.id })
    await state.save(); state.select(state.starters.value[0])
    expect(state.draft.value.id).toBe(saved.id)
  })
})
afterEach(() => { for (const app of apps.splice(0)) app.unmount(); vi.useRealTimers(); vi.unstubAllGlobals() })
describe('starter adoption and saved-template editing', () => {
  it('switches immediately to the acknowledged saved identity without a second list request', async () => {
    const state = mount(); await flush()
    api.saveEmailTemplate.mockResolvedValue({ ...saved, copyReused: false })
    await state.save(); await nextTick()
    expect(state.draft.value.id).toBe(saved.id); expect(state.dirty.value).toBe(false); expect(state.saving.value).toBe(false)
    expect(api.fetchEmailTemplates).toHaveBeenCalledTimes(1)
    state.draft.value.heading = 'Edited again'
    expect(state.dirty.value).toBe(true)
    api.saveEmailTemplate.mockResolvedValue({ ...saved, heading: 'Edited again', revision: 2 })
    await state.save()
    expect(api.saveEmailTemplate.mock.calls[1][0]).toMatchObject({ id: saved.id, heading: 'Edited again' })
    expect(api.saveEmailTemplate.mock.calls[1][0]).not.toHaveProperty('suggested')
    expect(state.draft.value.revision).toBe(2)
  })
  it('opens the saved template when returning to its starter and never submits another create', async () => {
    const state = mount(); await flush()
    api.saveEmailTemplate.mockResolvedValue(saved); await state.save()
    state.select(state.starters.value[0])
    expect(state.draft.value.id).toBe(saved.id)
    expect(state.message.value).toContain('No new copy')
    expect(state.savedTemplates.value).toHaveLength(1)
    expect(api.saveEmailTemplate).toHaveBeenCalledTimes(1)
    await state.save()
    expect(api.saveEmailTemplate).toHaveBeenCalledTimes(1)
  })
  it('opens an existing copy on a retry response without overwriting its content', async () => {
    const state = mount(); await flush()
    state.draft.value.heading = 'Unsaved starter words'
    api.saveEmailTemplate.mockResolvedValue({ ...saved, copyReused: true })
    await state.save()
    expect(state.draft.value.heading).toBe(saved.heading)
    expect(state.message.value).toContain('No new copy')
  })
  it('ignores double clicks while the first save is pending and allows editing after success', async () => {
    const state = mount(); await flush()
    let resolve
    api.saveEmailTemplate.mockReturnValue(new Promise(done => { resolve = done }))
    const first = state.save(); await state.save()
    expect(api.saveEmailTemplate).toHaveBeenCalledTimes(1)
    resolve(saved); await first
    state.draft.value.heading = 'Still editable'
    expect(state.saving.value).toBe(false); expect(state.dirty.value).toBe(true)
  })
  it('preserves the draft after a failed save and keeps archived copies out of My templates', async () => {
    api.fetchEmailTemplates.mockResolvedValue({ templates: [starter, { ...saved, archived: true }], checkoutReceipt: { mode: 'DISABLED' } })
    const state = mount(); await flush(); state.draft.value.heading = 'Keep this draft'
    api.saveEmailTemplate.mockRejectedValue(new Error('Fixture network failure'))
    await state.save()
    expect(state.draft.value.heading).toBe('Keep this draft'); expect(state.error.value).toContain('network failure')
    expect(state.saving.value).toBe(false); expect(state.archivedTemplates.value).toHaveLength(1); expect(state.savedTemplates.value).toHaveLength(0)
  })
})
