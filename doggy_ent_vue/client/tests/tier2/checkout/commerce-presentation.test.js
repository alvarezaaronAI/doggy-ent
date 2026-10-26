import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import CommerceItemCard from '../../../src/shared/components/CommerceItemCard.vue'
import CommerceGivingNote from '../../../src/shared/components/CommerceGivingNote.vue'
import CheckoutOrderSummary from '../../../src/domains/checkout/OrderSummary/CheckoutOrderSummary.vue'
import CheckoutCampaignPreview from '../../../src/domains/checkout/OrderSummary/CheckoutCampaignPreview.vue'
import { mapGivingCampaigns } from '../../../src/shared/mappers/commerceItem.mapper.js'
import CheckoutShippingSection from '../../../src/domains/checkout/Checkout/CheckoutShippingSection.vue'
import OrderConfirmationContent from '../../../src/domains/checkout/OrderSuccess/OrderConfirmationContent.vue'
import CheckoutSubmitSection from '../../../src/domains/checkout/Checkout/CheckoutSubmitSection.vue'
import AdminCommerceCanvas from '../../../src/domains/admin/components/AdminCommerceCanvas.vue'
import CampaignPageContent from '../../../src/domains/campaigns/components/CampaignPageContent.vue'
import { useCampaignQuickView } from '../../../src/domains/campaigns/composables/useCampaignQuickView.js'
import { commercePresentation, givingBeneficiaries } from '../../../src/domains/storefront/content/commercePresentation.js'
import { useCheckout } from '../../../src/domains/checkout/composables/useCheckout.js'
import { useCheckoutPage } from '../../../src/domains/checkout/composables/useCheckoutPage.js'
const auth = vi.hoisted(() => ({ signUp: vi.fn(), signIn: vi.fn() }))
vi.mock('../../../src/domains/account/composables/useAccountAuth.js', () => ({ useAccountAuth: () => ({ ...auth, loading: ref(false) }) }))
const { useCheckoutAuth } = await import('../../../src/domains/checkout/composables/useCheckoutAuth.js')
const item = { productId: 'p', productName: 'Real treat', size: '6 oz', sku: 'REAL-6', quantity: 2, unitPrice: 14.99, lineTotal: 29.98 }
async function render(component, props) {
  const router = createRouter({ history: createMemoryHistory(), routes: ['/', '/account/orders'].map(path => ({ path, component: { render: () => null } })) })
  await router.push('/'); return renderToString(createSSRApp(component, props).use(router))
}
beforeEach(() => vi.clearAllMocks())
describe('shared receipt presentation and checkout account workflow', () => {
  it('shows the actual variant, quantity, unit price and campaign plus promo attribution', async () => {
    const html = await render(CommerceItemCard, { item, campaigns: [{ id: 'c', name: 'Giving', donationType: 'PERCENT', donationValue: 20 }], promoCode: 'LOCALQA' })
    for (const value of ['6 oz', 'Qty 2', 'REAL-6', '$14.99 each', '$29.98', 'commerce-card-giving', 'commerce-card-promo', 'LOCALQA', 'Giving']) expect(html).toContain(value)
  })
  it('shows truthful guest receipt destination and does not claim an email was sent', async () => {
    const html = await render(OrderConfirmationContent, { order: { ...item, orderNumber: 'CE-1', createdAt: '2026-10-10T12:00:00Z', paymentStatus: 'PAID', status: 'PAID', customerEmail: 'guest@example.com', items: [item], receiptEmailStatus: 'NOT_SENT', total: 37 }, settings: commercePresentation().confirmation })
    expect(html).toContain('guest@example.com'); expect(html).toContain('No receipt email has been sent'); expect(html).toContain('Guest checkout'); expect(html).toContain('6 oz')
  })
  it('makes the secure order button available at mobile widths instead of XL-only', async () => {
    const html = await render(CheckoutSubmitSection, { isProcessingOrder: false, checkoutRequirementsComplete: false })
    expect(html).toContain('Complete Secure Order'); expect(html).not.toContain('xl:flex'); expect(html).toContain('disabled')
  })
  it('uses storefront yellow and brown for the ready action and retains a disabled processing state', async () => {
    const html = await render(CheckoutSubmitSection, { isProcessingOrder: false, checkoutRequirementsComplete: true })
    expect(html).toContain('bg-[var(--storefront-brand-2)]'); expect(html).toContain('text-[var(--storefront-brand-4)]')
    expect(html).not.toContain('disabled=""'); expect(html).not.toContain('bg-[var(--brand-1)]')
    const pending = await render(CheckoutSubmitSection, { isProcessingOrder: true, checkoutRequirementsComplete: true })
    expect(pending).toContain('disabled'); expect(pending).toContain('Processing Secure Payment'); expect(pending).toContain('motion-reduce:animate-none')
  })
  it('keeps incomplete checkout readiness Boolean so Vue cannot treat an empty field as ready', async () => {
    let state
    const html = await render({ setup() {
      state = useCheckoutPage()
      return () => h(CheckoutSubmitSection, { isProcessingOrder: false, checkoutRequirementsComplete: state.checkoutRequirementsComplete.value })
    } })
    expect(state.checkoutRequirementsComplete.value).toBe(false)
    expect(html).toContain('disabled'); expect(html).toContain('bg-stone-100')
  })
  it('requires password confirmation then reviews details before creating an account', async () => {
    const complete = vi.fn(), state = useCheckoutAuth('create', { firstName: 'Alex', lastName: 'Morgan', email: ' ALEX@example.com ' }, complete)
    state.form.password = 'test-password-123'; state.form.confirmPassword = 'different'
    await state.submit(); expect(state.message.value).toContain('match'); expect(auth.signUp).not.toHaveBeenCalled()
    state.form.confirmPassword = state.form.password
    await state.submit(); expect(state.review.value).toBe(true); expect(auth.signUp).not.toHaveBeenCalled()
    auth.signUp.mockResolvedValue({ id: 'customer' }); await state.submit()
    expect(auth.signUp).toHaveBeenCalledWith({ name: 'Alex Morgan', email: 'alex@example.com', password: 'test-password-123' }); expect(complete).toHaveBeenCalledOnce(); expect(state.form.password).toBe('')
  })
  it('confirms a session after signup without recreating an existing account on retry', async () => {
    const state = useCheckoutAuth('create', { firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com' }, vi.fn())
    state.form.password = state.form.confirmPassword = 'test-password-123'; await state.submit()
    auth.signUp.mockResolvedValue(null); auth.signIn.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'customer' })
    await state.submit(); expect(state.message.value).toContain('session'); await state.submit()
    expect(auth.signUp).toHaveBeenCalledOnce(); expect(auth.signIn).toHaveBeenCalledTimes(2)
  })
  it('reuses a completed wallet payment for order retry, never charging again', async () => {
    const pay = vi.fn().mockResolvedValue({ paymentIntentId: 'pi_test', checkoutProof: 'test-proof', status: 'succeeded' })
    const submit = vi.fn().mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce({ order: { orderNumber: 'CE-1' } })
    const state = useCheckout({ validateCheckout: () => true, stripePaymentForm: ref(null), submitOrder: submit, onSuccess: vi.fn() })
    await state.placeOrder({ paymentExecutor: pay }); expect(state.paymentCompleted.value).toBe(true)
    await state.placeOrder({ paymentExecutor: pay }); expect(pay).toHaveBeenCalledOnce(); expect(submit).toHaveBeenCalledTimes(2)
    expect(submit).toHaveBeenLastCalledWith(expect.objectContaining({ completedPaymentIntent: expect.objectContaining({ checkoutProof: 'test-proof' }) }))
  })
  it('supports safe wallet toggles without changing existing homepage document defaults', () => {
    expect(commercePresentation().checkout).toMatchObject({ applePay: true, googlePay: true })
    expect(commercePresentation({ checkout: { applePay: false } }).checkout).toMatchObject({ applePay: false, googlePay: true })
  })
  it('renders actual checkout sections in the editor without initializing payments', async () => {
    const html = await render(AdminCommerceCanvas, { draft: commercePresentation(), page: 'checkout', selected: 'checkout' })
    for (const text of ['Contact', 'Shipping', 'Delivery', 'Payment', 'Apple Pay enabled', 'Google Pay enabled', 'Card number', 'Your bag', '$32.24', 'Complete Secure Order', 'bg-[var(--storefront-brand-2)]']) expect(html).toContain(text)
    expect(html).not.toContain('Initializing secure payment')
  })
  it('does not claim a cancelled order is being prepared', async () => {
    const html = await render(OrderConfirmationContent, { order: { status: 'CANCELLED', paymentStatus: 'PAID', items: [], createdAt: '2026-10-10', total: 0 }, settings: commercePresentation().confirmation })
    expect(html).toContain('This order is cancelled.'); expect(html).not.toContain(commercePresentation().confirmation.nextText)
  })
  it('opens a campaign pop-out only for a published page and restores its closed state', () => {
    const state = useCampaignQuickView()
    state.openCampaign({ slug: 'private', pageAvailable: false }); expect(state.slug.value).toBe('')
    state.openCampaign({ slug: 'giving', pageAvailable: true }); expect(state.slug.value).toBe('giving')
    state.closeCampaign(); expect(state.slug.value).toBe('')
  })
  it('uses the same campaign story and giving renderer inside the pop-out', async () => {
    const html = await render(CampaignPageContent, { campaign: { name: 'Reviewed giving', description: 'Our community', story: 'A shared story.', donationType: 'PERCENT', donationValue: 20, donationTarget: 'Our partner', isActive: true, productIds: [] }, quickView: true })
    for (const text of ['Reviewed giving', 'Our community', 'A shared story.', 'Our partner', 'no extra', 'Explore all treats']) expect(html).toContain(text)
  })
  it('separates giving below the total without changing the bill or adding a donation row', async () => {
    const html = await render(CheckoutOrderSummary, { mobileSummaryOpen: true, cartItems: [item], itemCount: 2, summarySubtotal: 29.98, summaryDiscount: 3, summaryShipping: 5.99, summaryTax: 2.16, summaryTotal: 35.13, appliedPromoCode: 'LOCALQA', isRefreshingCheckoutPreview: false, formatPrice: value => '$' + value.toFixed(2) })
    const impact = await render(CheckoutCampaignPreview, { campaignPreview: [{ donationTarget: 'Community rescue' }], amount: 5.4, formatPrice: value => '$' + value.toFixed(2) })
    expect(impact).toContain('Supporting Community rescue'); expect(impact).toContain('No extra cost to you')
    expect(impact).toContain('not added to your bill'); expect(impact).toContain('$5.40'); expect(html).toContain('-$3.00')
    expect(html).not.toContain('Your order makes a difference'); expect(html).not.toContain('$5.40')
    const view = readFileSync(new URL('../../../src/domains/checkout/views/CheckoutView.vue', import.meta.url), 'utf8')
    expect(view.indexOf('<CheckoutCampaignPreview')).toBeGreaterThan(view.indexOf('</CheckoutBagDisclosure>'))
    expect(html).toContain('Items subtotal'); expect(html).toContain('(2 items)'); expect(html).toContain('Estimated tax'); expect(html).toContain('Order total')
    expect(html).not.toContain('>+</span>'); expect(html).not.toContain('>=</span>')
    expect(html).not.toContain('Donation generated'); expect(html).not.toContain('Estimated donation from')
  })
  it('hides giving when zero and deduplicates actual partner names', async () => {
    expect(await render(CommerceGivingNote, { amount: 0 })).not.toContain('Your order makes a difference')
    expect(givingBeneficiaries([{ donationTarget: ' Rescue ' }, { campaign: { donationTarget: 'Rescue' } }, { campaignName: 'Community' }])).toBe('Rescue, Community')
    expect(givingBeneficiaries()).toBe('our giving partners')
  })
  it('keeps the completed-order thank-you after paid totals, not among charges', async () => {
    const html = await render(OrderConfirmationContent, { order: { status: 'PAID', paymentStatus: 'PAID', items: [], createdAt: '2026-10-10', subtotal: 20, shippingAmount: 5, taxAmount: 2, total: 27, donationAmount: 4, campaignAttributions: [{ donationTarget: 'Rescue' }] }, settings: commercePresentation().confirmation })
    expect(html.indexOf('Your order makes a difference')).toBeGreaterThan(html.indexOf('Total paid'))
    expect(html).toContain('Supporting Rescue'); expect(html).toContain('No extra cost to you'); expect(html).not.toContain('generated for giving')
    expect(html.slice(html.indexOf('<dl'), html.indexOf('</dl>'))).not.toContain('$4.00')
  })
  it('joins publication metadata without replacing the server-owned giving amount or beneficiary', async () => {
    const attributions = [{ campaignId: 'c', campaignName: 'Reviewed giving', donationTarget: 'Saved rescue', donationAmount: 3, pageAvailable: true, slug: 'untrusted' }]
    expect(mapGivingCampaigns(attributions)).toEqual([expect.objectContaining({ donationAmount: 3, donationTarget: 'Saved rescue', pageAvailable: false, slug: '' })])
    const mapped = mapGivingCampaigns(attributions, [{ id: 'c', name: 'New title', slug: 'reviewed', pageAvailable: true }])
    expect(mapped[0]).toMatchObject({ donationAmount: 3, donationTarget: 'Saved rescue', slug: 'reviewed', pageAvailable: true })
    const html = await render(CommerceGivingNote, { amount: 3, campaigns: mapped, estimated: true })
    expect(html).toContain('About Reviewed giving'); expect(html).toContain('aria-haspopup="dialog"'); expect(html).toContain('Estimated contribution')
    expect(await render(CommerceGivingNote, { amount: 3, campaigns: mapped, interactive: false })).not.toContain('About Reviewed giving')
    expect(await render(CommerceGivingNote, { amount: 3, campaigns: mapGivingCampaigns(attributions) })).not.toContain('aria-haspopup')
  })
  it('labels shipping fields and enables postal autofill without claiming address verification', async () => {
    const html = await render(CheckoutShippingSection, { customer: { firstName: '', lastName: '', address1: '', city: '', state: '', zip: '', country: 'US' } })
    for (const text of ['Shipping address', 'Street address', 'First name', 'ZIP code', 'shipping address-line1', 'shipping postal-code', 'Add apartment', 'Use this address']) expect(html).toContain(text)
    expect(html).toContain('disabled'); expect(html).not.toContain('Address verified')
  })
  it('preserves prefilled apartment details and renders a province field for existing Canada support', async () => {
    const html = await render(CheckoutShippingSection, { customer: { firstName: 'Alex', lastName: 'Morgan', address1: '123 Example Lane', address2: 'Unit 2', city: 'Toronto', state: 'ON', zip: 'M5V 2T6', country: 'CA' } })
    for (const text of ['Province / territory', 'Postal code', 'Unit 2', 'shipping address-line2', 'ON']) expect(html).toContain(text)
    expect(html).not.toContain('Select state'); expect(html).not.toContain('Add apartment')
  })
})
