import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useCartDrawerDialog } from '../../../src/domains/cart/composables/useCartDrawerDialog.js'

const lifecycle = vi.hoisted(() => ({ cleanup: null, updated: null }))
vi.mock('vue', async (original) => ({
  ...await original(),
  onMounted: (callback) => callback(),
  onBeforeUnmount: (callback) => { lifecycle.cleanup = callback },
  onUpdated: (callback) => { lifecycle.updated = callback },
}))

let scope
afterEach(() => {
  lifecycle.cleanup?.()
  scope?.stop()
  vi.unstubAllGlobals()
})

function fixture() {
  const listeners = new Map()
  const document = { body: { style: { overflow: 'auto' } }, addEventListener: vi.fn((name, cb) => listeners.set(name, cb)), removeEventListener: vi.fn((name) => listeners.delete(name)) }
  function element(visible = true) {
    const node = { isConnected: true, closest: () => null, getClientRects: () => visible ? [{}] : [] }
    node.focus = vi.fn(() => { document.activeElement = node })
    return node
  }
  const opener = element()
  const first = element()
  const hidden = element(false)
  const last = element()
  document.activeElement = opener
  document.querySelector = () => opener
  const dialog = ref({ querySelectorAll: () => [first, hidden, last], contains: (node) => [first, hidden, last].includes(node) })
  vi.stubGlobal('document', document)
  const open = ref(false)
  const close = vi.fn(() => { open.value = false })
  scope = effectScope()
  const controls = scope.run(() => useCartDrawerDialog({ isOpen: () => open.value, dialog, close }))
  return { open, close, document, listeners, first, last, opener, ...controls }
}

async function openDrawer(state) {
  state.open.value = true
  await nextTick()
  await nextTick()
}

describe('cart drawer keyboard lifecycle', () => {
  it('focuses the drawer, locks scrolling, then restores both on close', async () => {
    const state = fixture()
    await openDrawer(state)
    expect(state.document.body.style.overflow).toBe('hidden')
    expect(state.first.focus).toHaveBeenCalled()
    state.open.value = false
    await nextTick()
    expect(state.document.body.style.overflow).toBe('auto')
    expect(state.opener.focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(state.listeners.size).toBe(0)
  })

  it('wraps Tab in both directions, skips hidden elements and contains outside focus', async () => {
    const state = fixture()
    await openDrawer(state)
    const preventDefault = vi.fn()
    state.onKeydown({ key: 'Tab', shiftKey: true, preventDefault })
    expect(state.last.focus).toHaveBeenCalled()
    state.onKeydown({ key: 'Tab', shiftKey: false, preventDefault })
    expect(state.document.activeElement).toBe(state.first)
    state.document.activeElement = state.opener
    state.listeners.get('focusin')({ target: state.opener })
    expect(state.document.activeElement).toBe(state.first)
    expect(preventDefault).toHaveBeenCalledTimes(2)
  })

  it('closes on Escape without handling keys while closed', async () => {
    const state = fixture()
    const event = { key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() }
    state.onKeydown(event)
    expect(state.close).not.toHaveBeenCalled()
    await openDrawer(state)
    state.onKeydown(event)
    expect(state.close).toHaveBeenCalledOnce()
    expect(event.stopPropagation).toHaveBeenCalledOnce()
  })

  it('recovers focus when a removed item takes its focused button out of the DOM', async () => {
    const state = fixture()
    await openDrawer(state)
    state.document.activeElement = state.document.body
    lifecycle.updated()
    expect(state.document.activeElement).toBe(state.first)
  })

  it('releases scrolling and listeners when navigation unmounts an open drawer', async () => {
    const state = fixture()
    await openDrawer(state)
    lifecycle.cleanup()
    expect(state.document.body.style.overflow).toBe('auto')
    expect(state.listeners.size).toBe(0)
    expect(state.opener.focus).not.toHaveBeenCalled()
  })
})
