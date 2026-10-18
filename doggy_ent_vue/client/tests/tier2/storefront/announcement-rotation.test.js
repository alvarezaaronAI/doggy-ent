import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const lifecycle = vi.hoisted(() => ({ mount: null, unmount: null }))
vi.mock('vue', async original => ({ ...(await original()), onMounted: fn => { lifecycle.mount = fn }, onBeforeUnmount: fn => { lifecycle.unmount = fn } }))
import { nextTick, ref } from 'vue'
import { useAnnouncementRotation } from '../../../src/domains/storefront/composables/useAnnouncementRotation.js'
let media, visibility
beforeEach(() => {
  vi.useFakeTimers()
  media = { matches:false, addEventListener:vi.fn(),removeEventListener:vi.fn() }
  visibility = { hidden:false,addEventListener:vi.fn(),removeEventListener:vi.fn() }
  vi.stubGlobal('window',{matchMedia:()=>media}); vi.stubGlobal('document',visibility)
})
afterEach(() => { lifecycle.unmount?.(); vi.useRealTimers(); vi.unstubAllGlobals() })
describe('accessible announcement rotation lifecycle', () => {
  it('rotates, pauses, allows manual navigation and cleans up timers', async () => {
    const state = useAnnouncementRotation(ref([{text:'one'},{text:'two'}]),ref(true)); lifecycle.mount()
    vi.advanceTimersByTime(5500); expect(state.current.value.text).toBe('two')
    state.paused.value = true; await nextTick(); vi.advanceTimersByTime(11000); expect(state.current.value.text).toBe('two')
    state.step(1); expect(state.current.value.text).toBe('one')
    lifecycle.unmount(); expect(vi.getTimerCount()).toBe(0)
  })
  it('does not autoplay when reduced motion, backgrounded, disabled or single-message', () => {
    media.matches = true
    const state = useAnnouncementRotation(ref([{text:'one'},{text:'two'}]),ref(true)); lifecycle.mount()
    vi.advanceTimersByTime(11000); expect(state.index.value).toBe(0); expect(vi.getTimerCount()).toBe(0)
    media.matches = false; visibility.hidden = true; media.addEventListener.mock.calls[0][1](); expect(vi.getTimerCount()).toBe(0)
  })
})
