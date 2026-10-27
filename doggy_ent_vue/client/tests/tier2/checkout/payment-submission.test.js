import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, markRaw, nextTick, ssrContextKey } from 'vue'
import StripeElementsForm from '../../../src/domains/payments/components/StripeElementsForm.vue'
import StripeWalletButtons from '../../../src/domains/payments/components/StripeWalletButtons.vue'

const provider = vi.hoisted(() => ({ getStripe: vi.fn(), createPaymentIntent: vi.fn() }))
vi.mock('../../../src/domains/payments/services/stripe.js', () => ({ getStripe: provider.getStripe }))
vi.mock('../../../src/domains/payments/services/payment.service.js', () => ({ createPaymentIntent: provider.createPaymentIntent }))

let apps
const props = { checkoutTotal: 14.99, cartItems: [{ id: 'offline-product', size: '6 oz', quantity: 1 }], customer: { email: 'qa@example.test' }, shipping: { method: 'standard' }, promoCode: 'OFFLINE10' }

function sdk() {
  const handlers = {}
  const control = { mount: vi.fn(), on: vi.fn((event, handler) => { handlers[event] = handler }), destroy: vi.fn() }
  const elements = { create: vi.fn(() => control), submit: vi.fn().mockResolvedValue({}) }
  const result = () => ({ paymentIntent: { id: 'pi_offline', status: 'succeeded' } })
  const stripe = { elements: vi.fn(() => elements), confirmCardPayment: vi.fn().mockResolvedValue(result()), confirmPayment: vi.fn().mockResolvedValue(result()) }
  return { handlers, control, elements, stripe }
}

async function mount(component, key, properties = props) {
  let state
  const renderer = createRenderer({ createElement: () => markRaw({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ ...component, render(_ctx, _cache, _props, setup) {
    state = setup
    return h('div', { ref: value => { setup[key] = value } })
  } }, properties)
  app.provide(ssrContextKey, { modules: new Set() })
  const exposed = app.mount({})
  apps.push(app)
  await nextTick(); await nextTick()
  return { exposed, state }
}

beforeEach(() => {
  apps = []
  provider.getStripe.mockReset()
  provider.createPaymentIntent.mockReset().mockResolvedValue({ clientSecret: 'offline-client-secret', checkoutProof: 'offline-proof', pricing: { total: 14.99 } })
  vi.stubGlobal('window', { location: { origin: 'https://shop.example.test' } })
})
afterEach(() => {
  for (const app of apps) app.unmount()
  vi.unstubAllGlobals()
})

async function card() {
  const fixture = sdk()
  provider.getStripe.mockResolvedValue(fixture.stripe)
  const view = await mount(StripeElementsForm, 'cardElementContainer')
  view.state.cardholderName = 'QA Customer'
  return { ...fixture, ...view }
}

async function wallet(properties = {}) {
  const fixture = sdk(), placeWalletOrder = vi.fn(async execute => { await execute(); return true })
  provider.getStripe.mockResolvedValue(fixture.stripe)
  const view = await mount(StripeWalletButtons, 'container', { ...props, applePay: true, googlePay: true, ready: true, placeWalletOrder, ...properties })
  const event = { paymentFailed: vi.fn() }
  return { ...fixture, ...view, placeWalletOrder, event }
}

describe('actual card payment submission with a mocked SDK', () => {
  it('requires a cardholder before creating any intent', async () => {
    const view = await card()
    view.state.cardholderName = ' '
    await expect(view.exposed.submitPayment()).rejects.toThrow('cardholder name')
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
    expect(view.stripe.confirmCardPayment).not.toHaveBeenCalled()
  })

  it('returns only the completed payment identity and scoped proof after confirmation', async () => {
    const view = await card()
    await expect(view.exposed.submitPayment()).resolves.toEqual({ paymentIntentId: 'pi_offline', status: 'succeeded', checkoutProof: 'offline-proof' })
    expect(provider.createPaymentIntent).toHaveBeenCalledWith({ cartItems: props.cartItems, customer: props.customer, shipping: props.shipping, promoCode: props.promoCode })
    expect(view.stripe.confirmCardPayment).toHaveBeenCalledWith('offline-client-secret', { payment_method: { card: view.control, billing_details: { name: 'QA Customer' } } })
  })

  it.each([15, 14.98, undefined])('does not confirm when server total %s differs or is absent', async total => {
    provider.createPaymentIntent.mockResolvedValue({ clientSecret: 'offline-client-secret', pricing: { total } })
    const view = await card()
    await expect(view.exposed.submitPayment()).rejects.toThrow('total changed')
    expect(view.stripe.confirmCardPayment).not.toHaveBeenCalled()
  })

  it('does not confirm a payment when intent creation fails', async () => {
    provider.createPaymentIntent.mockRejectedValue(new Error('Payment initialization unavailable.'))
    const view = await card()
    await expect(view.exposed.submitPayment()).rejects.toThrow('initialization unavailable')
    expect(view.stripe.confirmCardPayment).not.toHaveBeenCalled()
  })

  it('propagates a declined confirmation instead of returning payment success', async () => {
    const view = await card()
    view.stripe.confirmCardPayment.mockResolvedValue({ error: { message: 'Card declined.' } })
    await expect(view.exposed.submitPayment()).rejects.toThrow('Card declined.')
  })

  it.each(['requires_action', 'processing', 'requires_capture', 'canceled'])('does not treat %s as a completed order payment', async status => {
    const view = await card()
    view.stripe.confirmCardPayment.mockResolvedValue({ paymentIntent: { id: 'pi_offline', status } })
    await expect(view.exposed.submitPayment()).rejects.toThrow('could not be completed')
  })

  it('fails safely if the SDK could not initialize', async () => {
    provider.getStripe.mockResolvedValue(null)
    const view = await mount(StripeElementsForm, 'cardElementContainer')
    await expect(view.exposed.submitPayment()).rejects.toThrow('not initialized')
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
  })
})

describe('actual wallet confirmation handler with a mocked SDK', () => {
  it('submits Elements before creating the trusted intent and confirms with the same amount', async () => {
    const view = await wallet()
    await view.handlers.confirm(view.event)
    expect(view.elements.submit).toHaveBeenCalledOnce()
    expect(view.elements.submit.mock.invocationCallOrder[0]).toBeLessThan(provider.createPaymentIntent.mock.invocationCallOrder[0])
    expect(view.stripe.confirmPayment).toHaveBeenCalledWith({ elements: view.elements, clientSecret: 'offline-client-secret', confirmParams: { return_url: 'https://shop.example.test/checkout' }, redirect: 'if_required' })
    expect(view.stripe.confirmCardPayment).not.toHaveBeenCalled()
    expect(view.event.paymentFailed).not.toHaveBeenCalled()
  })

  it('does not create an intent when Elements validation fails', async () => {
    const view = await wallet()
    view.elements.submit.mockResolvedValue({ error: { message: 'Wallet details incomplete.' } })
    await view.handlers.confirm(view.event)
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
    expect(view.stripe.confirmPayment).not.toHaveBeenCalled()
    expect(view.event.paymentFailed).toHaveBeenCalledExactlyOnceWith({ reason: 'fail' })
  })

  it('does not confirm a changed trusted total', async () => {
    provider.createPaymentIntent.mockResolvedValue({ pricing: { total: 15.99 } })
    const view = await wallet()
    await view.handlers.confirm(view.event)
    expect(view.stripe.confirmPayment).not.toHaveBeenCalled()
    expect(view.event.paymentFailed).toHaveBeenCalledOnce()
    expect(view.state.message).toContain('total changed')
  })

  it('reports a declined wallet without indicating a successful payment', async () => {
    const view = await wallet()
    view.stripe.confirmPayment.mockResolvedValue({ error: { message: 'Wallet declined.' } })
    await view.handlers.confirm(view.event)
    expect(view.event.paymentFailed).toHaveBeenCalledOnce()
    expect(view.state.message).toBe('Wallet declined.')
  })

  it('does not label a paid wallet as payment-failed if later order saving fails', async () => {
    const placeWalletOrder = vi.fn(async execute => { await execute(); return false })
    const view = await wallet({ placeWalletOrder })
    await view.handlers.confirm(view.event)
    expect(placeWalletOrder).toHaveBeenCalledOnce()
    expect(view.stripe.confirmPayment).toHaveBeenCalledOnce()
    expect(view.event.paymentFailed).not.toHaveBeenCalled()
  })

  it('keeps an admin-disabled wallet method disabled in the SDK configuration', async () => {
    const view = await wallet({ applePay: false, googlePay: true })
    expect(view.elements.create).toHaveBeenCalledWith('expressCheckout', expect.objectContaining({ paymentMethods: expect.objectContaining({ applePay: 'never', googlePay: 'auto', link: 'never' }) }))
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
  })

  it('shows card fallback when neither supported wallet is available', async () => {
    const view = await wallet()
    view.handlers.ready({ availablePaymentMethods: null })
    expect(view.state.available).toBe(false)
    expect(view.state.message).toContain('Use card payment below')
    expect(view.placeWalletOrder).not.toHaveBeenCalled()
    expect(provider.createPaymentIntent).not.toHaveBeenCalled()
  })
})
