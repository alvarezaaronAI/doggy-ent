import { readonly, ref, watch } from 'vue'
import { useAccountAuth } from './useAccountAuth.js'
import { fetchAccountWishlist, saveWishlistProduct, removeWishlistProduct } from '../api/accountWishlist.api.js'

export function createWishlistStore(getOwner, api = { list: fetchAccountWishlist, save: saveWishlistProduct, remove: removeWishlistProduct }) {
  const entries = ref([]), loading = ref(false), loaded = ref(false), error = ref(''), pending = ref([])
  let owner = '', generation = 0, revision = 0, request
  function syncOwner() {
    const next = getOwner() || ''
    if (owner !== next) {
      owner = next; generation++; revision++; request = undefined
      entries.value = []; pending.value = []; loading.value = false; loaded.value = false; error.value = ''
    }
    return owner
  }
  async function load(force = false) {
    if (!syncOwner()) return false
    if (request) return request
    if (loaded.value && !force) return true
    const current = generation, version = revision
    loading.value = true; error.value = ''
    request = (async () => {
      try {
        const result = await api.list()
        if (current !== generation || getOwner() !== owner || version !== revision) return false
        if (!Array.isArray(result)) throw new Error('Invalid wishlist response.')
        entries.value = result; loaded.value = true
        return true
      } catch {
        if (current === generation && getOwner() === owner && version === revision) error.value = 'Your wishlist could not load. Please try again.'
        return false
      } finally {
        if (current === generation) { loading.value = false; request = undefined }
      }
    })()
    return request
  }
  const has = productId => entries.value.some(item => item.productId === productId)
  const isPending = productId => pending.value.includes(productId)
  async function toggle(productId) {
    if (!syncOwner() || isPending(productId)) return false
    pending.value = [...pending.value, productId]
    const current = generation
    try {
      if (!loaded.value && !await load()) return false
      if (current !== generation || getOwner() !== owner) return false
      const removing = has(productId)
      revision++; error.value = ''
      const result = await (removing ? api.remove(productId) : api.save(productId))
      if (current !== generation || getOwner() !== owner) return false
      revision++
      entries.value = removing ? entries.value.filter(item => item.productId !== productId) : [result, ...entries.value.filter(item => item.productId !== productId)]
      return true
    } catch (failure) {
      if (current === generation && getOwner() === owner) error.value = failure.status === 409 ? 'Your wishlist may be full or have changed on another device. Refresh it and try again.' : failure.status === 401 ? 'Please sign in again to update your wishlist.' : 'That change could not be saved. Please try again.'
      return false
    } finally { if (current === generation) pending.value = pending.value.filter(id => id !== productId) }
  }
  return { entries: readonly(entries), loading: readonly(loading), loaded: readonly(loaded), error: readonly(error), load, has, isPending, toggle, syncOwner }
}
const { user } = useAccountAuth()
const store = createWishlistStore(() => user.value?.id || '')
export function useAccountWishlist() {
  watch(() => user.value?.id || '', id => { store.syncOwner(); if (id) void store.load() }, { immediate: true, flush: 'sync' })
  return store
}
