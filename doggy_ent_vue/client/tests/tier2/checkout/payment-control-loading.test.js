import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, markRaw, nextTick, ssrContextKey } from 'vue'
import StripeElementsForm from '../../../src/domains/payments/components/StripeElementsForm.vue'
import StripeWalletButtons from '../../../src/domains/payments/components/StripeWalletButtons.vue'
const provider = vi.hoisted(() => ({ getStripe: vi.fn(), createPaymentIntent: vi.fn() }))
vi.mock('../../../src/domains/payments/services/stripe.js', () => ({ getStripe: provider.getStripe }))
vi.mock('../../../src/domains/payments/services/payment.service.js', () => ({ createPaymentIntent: provider.createPaymentIntent }))

function mount(component, refKey, props = {}) {
  const renderer = createRenderer({ createElement: () => markRaw({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ ...component, render(_ctx, _cache, _props, setup) { return h('div', { ref: value => { setup[refKey] = value } }) } }, props)
  app.provide(ssrContextKey, { modules: new Set() })
  app.mount({})
  return app
}
function sdk() {
  const control = { mount: vi.fn(), on: vi.fn(), destroy: vi.fn() }
  const elements = { create: vi.fn(() => control) }
  const stripe = { elements: vi.fn(() => elements) }
  return { stripe, elements, control }
}
beforeEach(() => { provider.getStripe.mockReset(); provider.createPaymentIntent.mockReset() })
describe('payment control initialization is lazy and lifecycle-safe', () => {
  it('does not load the SDK for an editor card preview', async () => {
    const app = mount(StripeElementsForm, 'cardElementContainer', { preview: true })
    await nextTick()
    expect(provider.getStripe).not.toHaveBeenCalled()
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
    app.unmount()
  })
  it('mounts the actual card control only after SDK resolution, with no payment intent', async () => {
    const fixture = sdk()
    provider.getStripe.mockResolvedValue(fixture.stripe)
    const app = mount(StripeElementsForm, 'cardElementContainer')
    await nextTick(); await nextTick()
    expect(provider.getStripe).toHaveBeenCalledOnce()
    expect(fixture.elements.create).toHaveBeenCalledWith('card', expect.any(Object))
    expect(fixture.control.mount).toHaveBeenCalledOnce()
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
    app.unmount()
    expect(fixture.control.destroy).toHaveBeenCalledOnce()
  })
  it('mounts wallets without submitting an order or payment', async () => {
    const fixture = sdk(), placeWalletOrder = vi.fn()
    provider.getStripe.mockResolvedValue(fixture.stripe)
    const app = mount(StripeWalletButtons, 'container', { checkoutTotal: 12, cartItems: [], placeWalletOrder })
    await nextTick(); await nextTick()
    expect(fixture.elements.create).toHaveBeenCalledWith('expressCheckout', expect.any(Object))
    expect(fixture.control.mount).toHaveBeenCalledOnce()
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
    expect(placeWalletOrder).not.toHaveBeenCalled()
    app.unmount()
    expect(fixture.control.destroy).toHaveBeenCalledOnce()
  })
  it.each([[StripeElementsForm, 'cardElementContainer'], [StripeWalletButtons, 'container']])('does not mount a late SDK after the payment control is removed', async (component, key) => {
    let resolve
    provider.getStripe.mockImplementation(() => new Promise(done => { resolve = done }))
    const fixture = sdk(), app = mount(component, key, { placeWalletOrder: vi.fn() })
    app.unmount(); resolve(fixture.stripe)
    await nextTick(); await nextTick()
    expect(fixture.stripe.elements).not.toHaveBeenCalled()
    expect(fixture.control.mount).not.toHaveBeenCalled()
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
  })
})
