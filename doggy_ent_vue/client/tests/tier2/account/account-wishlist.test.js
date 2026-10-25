import { describe, expect, it, vi } from 'vitest'
import { createWishlistStore } from '../../../src/domains/account/composables/useAccountWishlist.js'
function setup() {
  let owner = 'customer-a'
  const api = { list: vi.fn().mockResolvedValue([]), save: vi.fn(), remove: vi.fn().mockResolvedValue({ removed: true }) }
  const state = createWishlistStore(() => owner, api)
  return { state, api, changeOwner: id => { owner = id; state.syncOwner() } }
}
const item = { productId: 'product-a', createdAt: '2026-10-24T12:00:00Z' }
describe('customer-owned saved treats', () => {
  it('deduplicates list loads and saves only after server acknowledgement', async () => {
    const { state, api } = setup()
    await Promise.all([state.load(), state.load()])
    expect(api.list).toHaveBeenCalledTimes(1)
    let finish
    api.save.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const saving = state.toggle(item.productId)
    expect(state.has(item.productId)).toBe(false); expect(state.isPending(item.productId)).toBe(true)
    await state.toggle(item.productId); expect(api.save).toHaveBeenCalledTimes(1)
    finish(item); await saving
    expect(state.has(item.productId)).toBe(true); expect(state.isPending(item.productId)).toBe(false)
  })
  it('removes only the selected product and never creates a purchase', async () => {
    const { state, api } = setup(); api.list.mockResolvedValue([item, { ...item, productId: 'product-b' }])
    await state.load(); await state.toggle(item.productId)
    expect(api.remove).toHaveBeenCalledWith(item.productId)
    expect(state.entries.value.map(entry => entry.productId)).toEqual(['product-b'])
    expect(api.save).not.toHaveBeenCalled()
  })
  it('retains saved items after a failed removal and allows an explicit retry', async () => {
    const { state, api } = setup(); api.list.mockResolvedValue([item])
    await state.load(); api.remove.mockRejectedValueOnce(new Error('private backend text'))
    expect(await state.toggle(item.productId)).toBe(false)
    expect(state.has(item.productId)).toBe(true); expect(state.error.value).not.toContain('private')
    expect(await state.toggle(item.productId)).toBe(true); expect(state.entries.value).toEqual([])
  })
  it('does not mutate when the initial saved state is unknown', async () => {
    const { state, api } = setup(); api.list.mockRejectedValueOnce(new Error('offline'))
    expect(await state.toggle(item.productId)).toBe(false); expect(api.save).not.toHaveBeenCalled()
    api.save.mockResolvedValue(item)
    expect(await state.toggle(item.productId)).toBe(true); expect(state.has(item.productId)).toBe(true)
  })
  it('clears all private list state on logout/account switch and ignores old responses', async () => {
    const { state, api, changeOwner } = setup(); let finish
    api.list.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const loading = state.load(); changeOwner('customer-b'); finish([item]); await loading
    expect(state.entries.value).toEqual([]); expect(state.loaded.value).toBe(false)
    await state.load(); api.save.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const saving = state.toggle(item.productId); changeOwner(''); finish(item); await saving
    expect(state.entries.value).toEqual([]); expect(await state.toggle(item.productId)).toBe(false)
    expect(state.error.value).toBe('')
  })
  it('does not allow a delayed refresh to erase an acknowledged save', async () => {
    const { state, api } = setup(); await state.load(); let finish
    api.list.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const refresh = state.load(true); api.save.mockResolvedValue(item)
    await state.toggle(item.productId); finish([]); await refresh
    expect(state.has(item.productId)).toBe(true)
  })
  it('ignores a refresh begun during a mutation when its old snapshot arrives after acknowledgement', async () => {
    const { state, api } = setup(); await state.load(); let finishSave, finishList
    api.save.mockImplementationOnce(() => new Promise(resolve => { finishSave = resolve }))
    const saving = state.toggle(item.productId)
    api.list.mockImplementationOnce(() => new Promise(resolve => { finishList = resolve }))
    const refresh = state.load(true); finishSave(item); await saving; finishList([]); await refresh
    expect(state.has(item.productId)).toBe(true)
  })
  it.each([[409, 'full'], [401, 'sign in again'], [500, 'could not be saved']])('uses safe feedback for status %s', async (status, text) => {
    const { state, api } = setup(); await state.load()
    api.save.mockRejectedValue(Object.assign(new Error('private provider details'), { status }))
    await state.toggle(item.productId)
    expect(state.error.value).toContain(text); expect(state.entries.value).toEqual([])
  })
})
