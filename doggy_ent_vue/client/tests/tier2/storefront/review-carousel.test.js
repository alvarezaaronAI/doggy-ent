import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const lifecycle = vi.hoisted(() => ({ mount: null, unmount: null }))
vi.mock('vue', async original => ({
  ...(await original()),
  onMounted: fn => { lifecycle.mount = fn },
  onBeforeUnmount: fn => { lifecycle.unmount = fn },
}))
import { effectScope, nextTick, ref, shallowRef } from 'vue'
import { useReviewCarousel } from '../../../src/domains/storefront/composables/useReviewCarousel.js'

let media, documentState, intersection, resized, resizeObserver, intersectionObserver, scope

function element() {
  const track = {
    clientWidth: 600, scrollWidth: 2160, scrollLeft: 0,
    children: Array.from({ length: 7 }, (_, index) => ({ offsetLeft: index * 312, offsetWidth: 288 })),
  }
  track.scrollTo = vi.fn(({ left }) => { track.scrollLeft = left })
  return track
}

function setup({ target = element(), enabled = ref(true) } = {}) {
  const track = shallowRef(target), count = ref(7)
  scope = effectScope()
  const state = scope.run(() => useReviewCarousel(track, count, enabled))
  lifecycle.mount()
  return { state, track, count, enabled }
}

async function show() {
  intersection([{ isIntersecting: true, intersectionRatio: 1 }])
  await nextTick()
}

beforeEach(() => {
  vi.useFakeTimers()
  media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  documentState = { hidden: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  resizeObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  intersectionObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  vi.stubGlobal('window', { matchMedia: () => media })
  vi.stubGlobal('document', documentState)
  vi.stubGlobal('ResizeObserver', class { constructor(callback) { resized = callback; return resizeObserver } })
  vi.stubGlobal('IntersectionObserver', class { constructor(callback) { intersection = callback; return intersectionObserver } })
})
afterEach(() => {
  lifecycle.unmount?.()
  scope?.stop()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('bounded review carousel lifecycle', () => {
  it('only rotates overflowing reviews when visible, using eight-second intervals', async () => {
    const { state, track } = setup()
    expect(state.overflowing.value).toBe(true)
    expect(state.start.value).toBe(1)
    expect(state.end.value).toBe(2)
    expect(vi.getTimerCount()).toBe(0)
    await show()
    vi.advanceTimersByTime(7999)
    expect(track.value.scrollTo).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(track.value.scrollTo).toHaveBeenLastCalledWith({ left: 624, behavior: 'smooth' })
    state.measure()
    expect([state.start.value, state.end.value]).toEqual([3, 4])
  })

  it('pauses on hover, focus, explicit Pause and hidden tabs without stealing focus', async () => {
    const { state, track } = setup()
    await show()
    state.hovering.value = true
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
    state.hovering.value = false
    state.focusIn()
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
    state.focusOut({ currentTarget: { contains: () => true }, relatedTarget: {} })
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
    state.focusOut({ currentTarget: { contains: () => false }, relatedTarget: null })
    await nextTick()
    expect(vi.getTimerCount()).toBe(1)
    documentState.hidden = true
    documentState.addEventListener.mock.calls.find(([name]) => name === 'visibilitychange')[1]()
    expect(vi.getTimerCount()).toBe(0)
    documentState.hidden = false
    documentState.addEventListener.mock.calls.find(([name]) => name === 'visibilitychange')[1]()
    state.pause()
    await nextTick()
    vi.advanceTimersByTime(16000)
    expect(track.value.scrollTo).not.toHaveBeenCalled()
  })

  it('wraps manual navigation at either end and leaves rotation paused', async () => {
    const { state, track } = setup()
    await show()
    state.step(-1)
    expect(track.value.scrollLeft).toBe(1560)
    state.measure()
    expect([state.start.value, state.end.value]).toEqual([6, 7])
    state.step(1)
    expect(track.value.scrollLeft).toBe(0)
    await nextTick()
    expect(state.paused.value).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('respects changed reduced-motion preferences but keeps manual navigation available', async () => {
    const { state, track } = setup()
    await show()
    media.matches = true
    media.addEventListener.mock.calls[0][1]()
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
    state.step(1)
    expect(track.value.scrollTo).toHaveBeenLastCalledWith({ left: 624, behavior: 'instant' })
    media.matches = false
    media.addEventListener.mock.calls[0][1]()
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not autoplay for editor/disabled mode, fitting content or an offscreen section', async () => {
    const { state, track, enabled } = setup({ enabled: ref(false) })
    await show()
    expect(vi.getTimerCount()).toBe(0)
    enabled.value = true
    await nextTick()
    expect(vi.getTimerCount()).toBe(1)
    intersection([{ isIntersecting: false, intersectionRatio: 0 }])
    await nextTick()
    expect(vi.getTimerCount()).toBe(0)
    track.value.scrollWidth = track.value.clientWidth
    resized()
    await show()
    expect(state.overflowing.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('re-measures one-card mobile layouts and attaches observers when content arrives after mount', async () => {
    const { state, track } = setup({ target: null })
    expect(resizeObserver.observe).not.toHaveBeenCalled()
    track.value = element()
    track.value.clientWidth = 288
    await nextTick()
    expect(resizeObserver.observe).toHaveBeenCalledWith(track.value)
    expect(intersectionObserver.observe).toHaveBeenCalledWith(track.value)
    expect([state.start.value, state.end.value]).toEqual([1, 1])
    await show()
    expect(vi.getTimerCount()).toBe(1)
    const previous = track.value
    track.value = null
    await nextTick()
    expect(resizeObserver.unobserve).toHaveBeenCalledWith(previous)
    expect(intersectionObserver.unobserve).toHaveBeenCalledWith(previous)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('disconnects observers, listeners and timers on unmount', async () => {
    setup()
    await show()
    lifecycle.unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(resizeObserver.disconnect).toHaveBeenCalled()
    expect(intersectionObserver.disconnect).toHaveBeenCalled()
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(documentState.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
