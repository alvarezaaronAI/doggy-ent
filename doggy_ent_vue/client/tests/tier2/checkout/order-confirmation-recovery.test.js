import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, nextTick, ref } from 'vue'
import { useOrderConfirmation } from '../../../src/domains/checkout/composables/useOrderConfirmation.js'
const api = vi.hoisted(() => ({ order: vi.fn(), restore: vi.fn() }))
vi.mock('../../../src/domains/checkout/api/checkout.api.js', () => ({ fetchCheckoutOrder: api.order }))
vi.mock('../../../src/domains/checkout/api/checkoutRecovery.api.js', () => ({ restoreCheckoutReceipt: api.restore }))
const apps = []
function mount() {
  const reference = ref('CE-OLD'); let state
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() { state = useOrderConfirmation(reference); return () => h('div') } })
  app.mount({}); apps.push(app)
  return { state, reference, unmount: () => { app.unmount(); apps.splice(apps.indexOf(app), 1) } }
}
beforeEach(() => { vi.resetAllMocks() })
afterEach(() => { apps.splice(0).forEach(app => app.unmount()) })
describe('receipt-only navigation recovery', () => {
  it('retries the same receipt read only after matching scoped access is recovered', async () => {
    api.order.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce({ orderNumber: 'CE-OLD' })
    api.restore.mockResolvedValue(true)
    const flow = mount()
    await vi.waitFor(() => expect(flow.state.loading.value).toBe(false))
    expect(api.restore).toHaveBeenCalledWith('CE-OLD')
    expect(api.order.mock.calls).toEqual([['CE-OLD'], ['CE-OLD']])
    expect(flow.state.order.value.orderNumber).toBe('CE-OLD')
  })
  it('does not use failed capability recovery as permission for another receipt read', async () => {
    api.order.mockRejectedValue(new Error('Unavailable')); api.restore.mockResolvedValue(false)
    const flow = mount()
    await vi.waitFor(() => expect(flow.state.loading.value).toBe(false))
    expect(api.order).toHaveBeenCalledOnce(); expect(flow.state.order.value).toBeNull()
  })
  it('ignores an old recovery response after navigation to another receipt', async () => {
    let resolve
    api.order.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue({ orderNumber: 'CE-NEW' })
    api.restore.mockReturnValue(new Promise(done => { resolve = done }))
    const flow = mount(); await nextTick()
    flow.reference.value = 'CE-NEW'; await nextTick(); resolve(true)
    await vi.waitFor(() => expect(flow.state.loading.value).toBe(false))
    expect(api.order.mock.calls).toEqual([['CE-OLD'], ['CE-NEW']])
    expect(flow.state.order.value.orderNumber).toBe('CE-NEW')
  })
  it('does not fetch or restore private view data after unmount', async () => {
    let resolve
    api.order.mockRejectedValueOnce(new Error('Unavailable'))
    api.restore.mockReturnValue(new Promise(done => { resolve = done }))
    const flow = mount(); await nextTick(); flow.unmount(); resolve(true)
    await nextTick(); await nextTick()
    expect(api.order).toHaveBeenCalledOnce(); expect(flow.state.order.value).toBeNull()
  })
})
