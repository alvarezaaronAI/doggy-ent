import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, nextTick, ref } from 'vue'
import { useCheckoutPage } from '../../../src/domains/checkout/composables/useCheckoutPage.js'
import { cartFingerprint, newCheckoutRecovery, saveCheckoutRecovery } from '../../../src/domains/checkout/utils/checkoutRecovery.js'
import { getReceiptAccess } from '../../../src/domains/checkout/utils/receiptAccess.js'

const api = vi.hoisted(() => ({ get: vi.fn(), finalize: vi.fn(), cancel: vi.fn(), create: vi.fn(), push: vi.fn(), preview: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: api.push }) }))
vi.mock('../../../src/domains/checkout/api/checkout.api.js', () => ({
  submitCheckout: vi.fn(), submitCheckoutPreview: api.preview,
  fetchCheckoutShippingOptions: vi.fn().mockResolvedValue({ options: [{ method: 'standard', price: 5.99 }] }),
  fetchCheckoutShippingRates: vi.fn().mockResolvedValue({ options: [] }),
}))
vi.mock('../../../src/domains/checkout/api/checkoutRecovery.api.js', async original => ({ ...await original(), fetchCheckoutAttempt: api.get, finalizeCheckoutAttempt: api.finalize, cancelCheckoutAttempt: api.cancel }))
vi.mock('../../../src/domains/payments/services/payment.service.js', () => ({ getPaymentConfiguration: vi.fn().mockResolvedValue({ enabled: false, recoveryEnabled: true }), createPaymentIntent: api.create }))
vi.mock('../../../src/domains/account/api/account.api.js', () => ({ fetchAccountProfile: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../src/domains/campaigns/api/campaigns.api.js', () => ({ previewCampaigns: vi.fn().mockResolvedValue([{ campaignName: 'Mutable giving', donationAmount: 100 }]) }))
vi.mock('../../../src/domains/campaigns/composables/useStorefrontCampaigns.js', () => ({ useStorefrontCampaigns: () => ({ campaigns: ref([]), loadCampaigns: vi.fn() }) }))

const cart = [{ id: 'fixture', size: '6 oz', quantity: 2, price: 10 }]
const customer = { email: 'saved@example.test', phone: '5550100000', firstName: 'Saved', lastName: 'Person', address1: '1 Example Street', address2: '', city: 'Example', state: 'CA', zip: '90001', country: 'United States', saveInfo: false }
const giving = [{ campaignId: 'frozen-campaign', campaignName: 'Frozen giving', donationTarget: 'Saved beneficiary', donationAmount: 3, matchedProductIds: ['fixture'] }]
let storage, record, response
const apps = []
async function mount(status = 'COMPLETED', currentCart = cart, savedCustomer = customer) {
  storage.set('doggy-ent-cart', JSON.stringify(currentCart))
  record = newCheckoutRecovery(await cartFingerprint(cart)); saveCheckoutRecovery(record)
  response = { attempt: { id: record.id, status, amountCents: 2300, currency: 'usd', allowedActions: status === 'OPEN' || status === 'PREPARED' ? ['confirm', 'cancel'] : [],
    items: cart, customer: savedCustomer, shipping: { method: 'priority', price: 5, service: 'Saved priority' },
    pricing: { subtotal: 20, discountAmount: 2, shippingAmount: 5, taxAmount: 0, total: 23, donationAmount: 3 },
    promo: { valid: true, code: 'FROZEN10', discountType: 'PERCENT', discountValue: 10, discountAmount: 2 }, campaigns: giving,
  }, ...(status === 'COMPLETED' ? { orderReference: 'CE-PAGE', receiptAccess: 'offline-page-receipt' } : {}) }
  api.get.mockImplementation(async () => response)
  let state
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() { state = useCheckoutPage(); return () => h('div') } })
  app.mount({}); apps.push(app)
  await vi.waitFor(() => expect(state.recoveryUi.value.busy).toBe(false)); await nextTick()
  return state
}
beforeEach(() => {
  vi.clearAllMocks(); storage = new Map()
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) })
  vi.stubGlobal('window', { setTimeout, clearTimeout, addEventListener() {}, removeEventListener() {} })
  api.push.mockResolvedValue(undefined)
  api.preview.mockRejectedValue(new Error('No current quote available'))
})
afterEach(() => { apps.splice(0).forEach(app => app.unmount()); vi.unstubAllGlobals() })

describe('actual recovered checkout page', () => {
  it('keeps frozen amounts, discount labels, giving and item count with an empty current bag', async () => {
    const state = await mount('COMPLETED', [])
    expect(state.summaryTotal.value).toBe(23); expect(state.summarySubtotal.value).toBe(20)
    expect(state.summaryDiscount.value).toBe(2); expect(state.summaryTax.value).toBe(0)
    expect(state.summaryPromo.value).toEqual(response.attempt.promo)
    expect(state.summaryAppliedPromoCode.value).toBe('FROZEN10')
    expect(state.campaignPreview.value).toEqual(giving); expect(state.summaryDonation.value).toBe(3)
    expect(state.itemCount.value).toBe(2); expect(state.summaryCartItems.value).toEqual(cart)
    expect(state.summaryPreviewError.value).toBe(''); expect(state.campaignPreviewLoading.value).toBe(false)
    expect(state.stripePaymentForm.value).toBeNull(); expect(state.recoveryUi.value.hideControls).toBe(true)
    expect(api.push).not.toHaveBeenCalled()
    api.push.mockImplementationOnce(async () => { expect(getReceiptAccess('CE-PAGE')).toBe('offline-page-receipt') })
    await state.recoveryUi.value.check()
    expect(api.push).toHaveBeenCalledWith('/order-success/CE-PAGE')
    expect(api.create).not.toHaveBeenCalled()
  })

  it('preserves an unrelated bag and changed form when opening the completed receipt', async () => {
    const unrelated = [{ id: 'other-product', size: '18 oz', quantity: 1, price: 40 }]
    const state = await mount('COMPLETED', unrelated)
    state.customer.value.email = 'new@example.test'; state.customer.value.address1 = 'Changed address'
    await state.recoveryUi.value.check()
    expect(state.cartItems.value).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'other-product' })]))
    expect(JSON.parse(storage.get('doggy-ent-cart'))).toEqual(unrelated)
    expect(state.customer.value.email).toBe('new@example.test'); expect(state.customer.value.address1).toBe('Changed address')
    expect(storage.has('doggy-ent-checkout-customer')).toBe(false)
  })

  it('restores authorized unpaid fields and shipping without replacing the matching bag', async () => {
    const state = await mount('PREPARED')
    expect(state.customer.value.email).toBe(customer.email); expect(state.customer.value.address1).toBe(customer.address1)
    expect(state.selectedShipping.value).toBe('priority')
    expect(state.buildSelectedShippingPayload().price).toBe(5)
    expect(state.appliedPromoCode.value).toBe('FROZEN10')
    expect(state.cartItems.value[0].id).toBe('fixture')
    expect(api.create).not.toHaveBeenCalled()
  })

  it('does not restore unpaid form details over a different bag', async () => {
    const state = await mount('OPEN', [{ id: 'different', size: '6 oz', quantity: 1 }])
    expect(state.customer.value.email).toBe(''); expect(state.customer.value.address1).toBe('')
    expect(state.cartItems.value[0].id).toBe('different')
  })

  it('preserves explicitly chosen remembered details from the frozen customer only after completion', async () => {
    const state = await mount('COMPLETED', cart, { ...customer, saveInfo: true })
    expect(storage.has('doggy-ent-checkout-customer')).toBe(false)
    state.customer.value.email = 'unrelated@example.test'; state.customer.value.address1 = 'Unrelated address'
    await state.recoveryUi.value.check()
    const remembered = JSON.parse(storage.get('doggy-ent-checkout-customer'))
    expect(remembered.email).toBe(customer.email); expect(remembered.address1).toBe(customer.address1)
    expect(state.customer.value.email).toBe('unrelated@example.test')
    expect(remembered).not.toHaveProperty('deliveryNotes')
  })
  it('honors the frozen remember-details opt-out when completing its matching bag', async () => {
    const state = await mount('COMPLETED', cart, { ...customer, saveInfo: false })
    storage.set('doggy-ent-checkout-customer', JSON.stringify({ email: 'old@example.test', saveInfo: true }))
    await state.recoveryUi.value.check()
    expect(storage.has('doggy-ent-checkout-customer')).toBe(false)
  })
})
