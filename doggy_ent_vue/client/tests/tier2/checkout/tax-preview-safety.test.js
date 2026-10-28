import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, nextTick, ref } from 'vue'
import { useCheckoutPreview } from '../../../src/domains/checkout/composables/useCheckoutPreview.js'
import { useCheckoutPage } from '../../../src/domains/checkout/composables/useCheckoutPage.js'

const api = vi.hoisted(() => ({ preview: vi.fn(), order: vi.fn() }))
vi.mock('../../../src/domains/checkout/api/checkout.api.js', () => ({
  submitCheckoutPreview: api.preview, submitCheckout: api.order,
  fetchCheckoutShippingOptions: vi.fn().mockResolvedValue({ options: [] }),
  fetchCheckoutShippingRates: vi.fn().mockResolvedValue({ options: [] }),
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('../../../src/domains/account/api/account.api.js', () => ({ fetchAccountProfile: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../src/domains/campaigns/api/campaigns.api.js', () => ({ previewCampaigns: vi.fn().mockResolvedValue([]) }))
vi.mock('../../../src/domains/campaigns/composables/useStorefrontCampaigns.js', () => ({ useStorefrontCampaigns: () => ({ campaigns: ref([]), loadCampaigns: vi.fn() }) }))

const pricing = (overrides = {}) => ({ subtotal: 30, discountAmount: 0, shippingAmount: 5, taxAmount: 0, total: 35,
  taxDetails: { provider: 'none', status: 'not_configured', taxAmount: 0, ratePercent: null, location: { country: 'US' }, breakdown: [] }, ...overrides })
const customer = () => ({ email: 'fixture@example.test', phone: '5550100000', firstName: 'Fixture', lastName: 'Person', address1: '123 Example Lane', address2: '', city: 'Example City', state: 'CA', zip: '90001', country: 'US' })
const apps = []
function mount(setup) {
  let state
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() { state = setup(); return () => h('div') } })
  app.mount({}); apps.push(app)
  return state
}
function fixture() {
  const input = { cartItems: ref([{ productId: 'fixture', price: 30, quantity: 1 }]), appliedPromoCode: ref(''), customer: ref(customer()), selectedShipping: ref('standard'), shippingPrice: ref(5) }
  return { ...input, state: mount(() => useCheckoutPreview(input)) }
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks()
  vi.stubGlobal('window', { setTimeout, clearTimeout })
  vi.stubGlobal('localStorage', { getItem: key => key === 'doggy-ent-cart' ? JSON.stringify([{ productId: 'fixture', price: 30, quantity: 1 }]) : null, setItem: vi.fn(), removeItem: vi.fn() })
  api.preview.mockResolvedValue({ pricing: pricing() })
})
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); vi.useRealTimers(); vi.unstubAllGlobals() })

describe('current preview only, with no local tax fallback', () => {
  it('starts without pricing and trusts a valid disabled-tax quote only after the response', async () => {
    const { state } = fixture()
    expect(state.trustedPricing.value).toBeNull()
    const pending = state.refreshCheckoutPreview()
    expect(state.trustedPricing.value).toBeNull()
    await pending
    expect(state.trustedPricing.value).toEqual(pricing())
    expect(api.preview.mock.calls[0][0].customer.country).toBe('United States')
  })

  it.each(['customer', 'cart', 'promo', 'shipping', 'shippingPrice'])('invalidates pricing synchronously when %s changes, including during the debounce', async field => {
    const flow = fixture(); await flow.state.refreshCheckoutPreview()
    if (field === 'customer') flow.customer.value.zip = '10001'
    if (field === 'cart') flow.cartItems.value[0].quantity = 2
    if (field === 'promo') flow.appliedPromoCode.value = 'FIXTURE'
    if (field === 'shipping') flow.selectedShipping.value = 'priority'
    if (field === 'shippingPrice') flow.shippingPrice.value = 10
    expect(flow.state.trustedPricing.value).toBeNull()
    expect(flow.state.checkoutPreviewResult.value).toBeNull()
    expect(flow.state.isRefreshingCheckoutPreview.value).toBe(true)
  })

  it('never restores an old address quote after a newer preview succeeds', async () => {
    const old = deferred(), current = deferred(), flow = fixture()
    api.preview.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const first = flow.state.refreshCheckoutPreview()
    flow.customer.value.zip = '10001'
    const second = flow.state.refreshCheckoutPreview()
    current.resolve({ pricing: pricing({ total: 40 }) }); await second
    old.resolve({ pricing: pricing({ total: 35 }) }); await first
    expect(flow.state.trustedPricing.value.total).toBe(40)
  })

  it('clears stale pricing on failure, shows safe feedback, then permits an explicit successful retry', async () => {
    const flow = fixture(); await flow.state.refreshCheckoutPreview()
    api.preview.mockRejectedValueOnce(new Error('PRIVATE_PROVIDER_DETAIL'))
    await flow.state.refreshCheckoutPreview()
    expect(flow.state.trustedPricing.value).toBeNull()
    expect(flow.state.checkoutPreviewError.value).toContain('Retry before paying')
    expect(flow.state.checkoutPreviewError.value).not.toContain('PRIVATE_')
    await flow.state.refreshCheckoutPreview()
    expect(flow.state.checkoutPreviewError.value).toBe('')
    expect(flow.state.trustedPricing.value.total).toBe(35)
  })

  it('ignores an old failure and cancels in-flight work when the bag becomes empty', async () => {
    const old = deferred(), flow = fixture()
    api.preview.mockReturnValueOnce(old.promise)
    const first = flow.state.refreshCheckoutPreview()
    flow.cartItems.value = []
    await flow.state.refreshCheckoutPreview()
    old.reject(new Error('Old failure')); await first
    expect(flow.state.trustedPricing.value).toBeNull()
    expect(flow.state.checkoutPreviewError.value).toBe('')
    expect(flow.state.isRefreshingCheckoutPreview.value).toBe(false)
  })

  it.each([{}, { pricing: null }, { pricing: pricing({ total: null }) }, { pricing: pricing({ taxDetails: {} }) }])('rejects malformed preview pricing %s', async result => {
    api.preview.mockResolvedValueOnce(result)
    const { state } = fixture(); await state.refreshCheckoutPreview()
    expect(state.trustedPricing.value).toBeNull()
    expect(state.checkoutPreviewError.value).not.toBe('')
  })

  it('does not apply a response after unmount', async () => {
    const pending = deferred(), flow = fixture()
    api.preview.mockReturnValueOnce(pending.promise)
    const refresh = flow.state.refreshCheckoutPreview()
    apps[0].unmount(); apps.splice(0)
    pending.resolve({ pricing: pricing() }); await refresh
    expect(flow.state.trustedPricing.value).toBeNull()
  })
})

describe('actual checkout card and wallet tax readiness', () => {
  async function page() {
    const state = mount(useCheckoutPage)
    Object.assign(state.customer.value, customer())
    state.paymentFormComplete.value = true
    state.stripePaymentForm.value = { submitPayment: vi.fn() }
    await nextTick(); await vi.advanceTimersByTimeAsync(700)
    await state.refreshCheckoutPreview(); await nextTick()
    return state
  }

  it('uses zero from the server when setup is pending, never a local 7.5% estimate', async () => {
    const state = await page()
    expect(state.summaryTax.value).toBe(0); expect(state.summaryTotal.value).toBe(35)
    expect(state.summaryTaxDetails.value.status).toBe('not_configured')
    expect(state.walletReady.value).toBe(true); expect(state.checkoutRequirementsComplete.value).toBe(true)
  })

  it('blocks card and wallet initiation immediately after an address edit and after preview failure, retaining bag and details', async () => {
    const state = await page(), wallet = vi.fn()
    state.customer.value.zip = '10001'
    expect(state.summaryTax.value).toBeNull(); expect(state.summaryTotal.value).toBeNull()
    expect(state.walletReady.value).toBe(false); expect(state.checkoutRequirementsComplete.value).toBe(false)
    await state.placeOrder(); await state.placeWalletOrder(wallet)
    expect(state.stripePaymentForm.value.submitPayment).not.toHaveBeenCalled(); expect(wallet).not.toHaveBeenCalled()
    api.preview.mockRejectedValueOnce(new Error('Tax unavailable'))
    await state.refreshCheckoutPreview()
    await state.placeOrder(); await state.placeWalletOrder(wallet)
    expect(state.stripePaymentForm.value.submitPayment).not.toHaveBeenCalled(); expect(wallet).not.toHaveBeenCalled()
    expect(api.order).not.toHaveBeenCalled()
    expect(state.cartItems.value).toHaveLength(1); expect(state.customer.value.zip).toBe('10001')
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('does not make pending-address pricing payable even when the server supplied numeric totals', async () => {
    api.preview.mockResolvedValue({ pricing: pricing({ taxDetails: { ...pricing().taxDetails, provider: 'stripe', status: 'pending_address' } }) })
    const state = await page(), wallet = vi.fn()
    expect(state.summaryTaxDetails.value.status).toBe('pending_address')
    expect(state.summaryTotal.value).toBeNull(); expect(state.summaryTax.value).toBeNull()
    expect(state.walletReady.value).toBe(false); await state.placeWalletOrder(wallet)
    expect(wallet).not.toHaveBeenCalled()
  })

  it('blocks unsupported saved destinations even with an otherwise successful preview', async () => {
    const state = await page(), wallet = vi.fn()
    state.customer.value.country = 'CA'; state.customer.value.state = 'ON'
    await state.refreshCheckoutPreview()
    expect(state.checkoutRequirementsComplete.value).toBe(false); expect(state.walletReady.value).toBe(false)
    await state.placeOrder(); await state.placeWalletOrder(wallet)
    expect(state.checkoutStatus.value).toContain('50 US states')
    expect(wallet).not.toHaveBeenCalled(); expect(state.stripePaymentForm.value.submitPayment).not.toHaveBeenCalled()
    expect(state.customer.value.country).toBe('CA'); expect(state.customer.value.state).toBe('ON')
  })
})
