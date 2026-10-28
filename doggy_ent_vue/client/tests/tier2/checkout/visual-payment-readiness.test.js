import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { readFileSync } from 'node:fs'
import { buildPaymentReadiness, hasCompleteDeliveryAddress } from '../../../src/domains/checkout/utils/checkoutReadiness.js'
import CheckoutPaymentSection from '../../../src/domains/checkout/Checkout/CheckoutPaymentSection.vue'
import CheckoutSubmitSection from '../../../src/domains/checkout/Checkout/CheckoutSubmitSection.vue'
import CheckoutTotals from '../../../src/domains/checkout/OrderSummary/CheckoutTotals.vue'

const steps = () => ['contact', 'shipping', 'delivery'].map(id => ({ id, complete: true }))
const address = { firstName: 'Sample', lastName: 'Person', address1: '1 Example St', city: 'Example City', state: 'CA', zip: '90001', country: 'US' }
const render = (component, props) => renderToString(createSSRApp(component, props))
const money = value => `$${Number(value).toFixed(2)}`

describe('visual checkout prerequisites', () => {
  it.each(['contact', 'shipping', 'delivery'])('directs to the first missing %s requirement with a working action', id => {
    const value = buildPaymentReadiness({ steps: steps().map(step => ({ ...step, complete: step.id !== id })), quoteReady: true })
    expect(value.action.step).toBe(id)
    expect(value.canEnterPayment).toBe(false)
    expect(value.steps.find(step => step.id === id).complete).toBe(false)
  })

  it('does not treat missing steps as completed or enable an empty bag', () => {
    expect(buildPaymentReadiness({ quoteReady: true }).canEnterPayment).toBe(false)
    const value = buildPaymentReadiness({ steps: steps(), quoteReady: true, empty: true })
    expect(value.canEnterPayment).toBe(false); expect(value.action.step).toBe('bag')
  })

  it('shows an updating total state, safe explicit retry, then payment entry without auto-payment', () => {
    const updating = buildPaymentReadiness({ steps: steps(), quoteReady: false, loading: true })
    expect(updating.action).toMatchObject({ step: 'total', busy: true })
    expect(updating.canEnterPayment).toBe(false)
    const failed = buildPaymentReadiness({ steps: steps(), error: 'Fixture error' })
    expect(failed.action).toEqual({ step: 'total', label: 'Retry order total', busy: false })
    const ready = buildPaymentReadiness({ steps: steps(), quoteReady: true })
    expect(ready.canEnterPayment).toBe(true)
    expect(ready.action).toEqual({ step: 'payment', label: 'Enter payment details' })
    expect(buildPaymentReadiness({ steps: steps(), quoteReady: true, cardComplete: true }).action).toBeNull()
  })

  it('retains the completed-payment recovery path without requiring another quote', () => {
    const result = buildPaymentReadiness({ steps: steps(), paid: true, cardComplete: true, loading: true, error: 'Quote unavailable' })
    expect(result.canEnterPayment).toBe(true); expect(result.action).toBeNull()
  })

  it('shows delivery updating rather than prompting selection while rates are refreshing', () => {
    const value = buildPaymentReadiness({ steps: steps().map(step => ({ ...step, complete: step.id !== 'delivery' })), deliveryLoading: true, loading: true })
    expect(value.action).toMatchObject({ step: 'delivery', busy: true, busyLabel: 'Updating delivery' })
    expect(value.canEnterPayment).toBe(false)
  })

  it.each(['', '1234', '9000X', '90001-1'])('does not call malformed ZIP %j a complete address', zip => {
    expect(hasCompleteDeliveryAddress({ ...address, zip })).toBe(false)
  })
  it('supports US ZIP and ZIP+4 but preserves foreign input as incomplete', () => {
    expect(hasCompleteDeliveryAddress(address)).toBe(true)
    expect(hasCompleteDeliveryAddress({ ...address, zip: '90001-1234' })).toBe(true)
    const foreign = { ...address, country: 'CA', state: 'ON' }
    expect(hasCompleteDeliveryAddress(foreign)).toBe(false); expect(foreign.state).toBe('ON')
  })

  it('shows standard card fields before totals are ready, without an extra readiness panel or fake amount', async () => {
    const html = await render(CheckoutPaymentSection, { checkoutTotal: null, cartItems: [] })
    expect(html).toContain('Name on card'); expect(html).toContain('Card details')
    expect(html).toContain('Secure payment by Stripe')
    expect(html).not.toContain('A few details'); expect(html).not.toContain('Details needed for payment')
    expect(html).not.toContain('Payment is unavailable'); expect(html).not.toContain('$0.00')
  })

  it('replaces the disabled submit with a non-submitting continuation, not an enabled charge button', async () => {
    const html = await render(CheckoutSubmitSection, { isProcessingOrder: false, checkoutRequirementsComplete: false, nextAction: { step: 'shipping', label: 'Complete delivery address' } })
    expect(html).toContain('type="button"'); expect(html).toContain('Complete delivery address')
    expect(html).not.toContain('type="submit"'); expect(html).not.toContain('disabled=""')
    const paying = await render(CheckoutSubmitSection, { isProcessingOrder: true, checkoutRequirementsComplete: true, nextAction: { step: 'contact' } })
    expect(paying).toContain('type="submit"'); expect(paying).toMatch(/<button[^>]*\sdisabled(?:\s|>|=)/); expect(paying).toContain('Processing payment')
  })

  it('shows the verified amount on the pay button and never asks an already-paid retry to pay again', async () => {
    const html = await render(CheckoutSubmitSection, { isProcessingOrder: false, checkoutRequirementsComplete: true, checkoutTotal: 34.17 })
    expect(html).toContain('Pay $34.17')
    const paid = await render(CheckoutSubmitSection, { isProcessingOrder: false, checkoutRequirementsComplete: true, checkoutTotal: null, paymentCompleted: true })
    expect(paid).toContain('Finish your order'); expect(paid).not.toContain('Pay $')
  })
})

describe('estimates are presentation, not payment authority', () => {
  const totals = { summarySubtotal: 30, summaryDiscount: 3, summaryShipping: 5, summaryTax: null, summaryTotal: null, estimatedTotal: 32, totalIsEstimate: true, isRefreshingCheckoutPreview: true, formatPrice: money }
  it('shows known estimated costs before tax instead of a blank total or fabricated tax rate', async () => {
    const html = await render(CheckoutTotals, totals)
    expect(html).toContain('Estimated total before tax'); expect(html).toContain('$32.00')
    expect(html).toContain('At delivery step'); expect(html).toContain('Updating your estimate')
    expect(html).not.toContain('$0.00'); expect(html).not.toContain('%')
  })
  it('replaces the estimate with the exact current server total, never silently recalculates it', async () => {
    const html = await render(CheckoutTotals, { ...totals, isRefreshingCheckoutPreview: false, summaryTax: 2, summaryTotal: 34.17, totalIsEstimate: false })
    expect(html).toContain('Order total'); expect(html).toContain('$34.17'); expect(html).not.toContain('$32.00')
  })
  it('retains the actual tax amount without extra setup copy, an exemption claim or guessed percentage', async () => {
    const html = await render(CheckoutTotals, { ...totals, isRefreshingCheckoutPreview: false, summaryTax: 0, summaryTotal: 32, summaryTaxDetails: { provider: 'none', status: 'not_configured' }, totalIsEstimate: false })
    expect(html).toContain('>Tax'); expect(html).toContain('$0.00')
    expect(html).not.toContain('Tax is not collected'); expect(html).not.toContain('setup is pending')
    expect(html).not.toContain('exempt'); expect(html).not.toContain('0%')
  })
  it('passes only current summaryTotal to payment and retains mounted card entry during refresh', () => {
    const view = readFileSync(new URL('../../../src/domains/checkout/views/CheckoutView.vue', import.meta.url), 'utf8')
    const section = readFileSync(new URL('../../../src/domains/checkout/Checkout/CheckoutPaymentSection.vue', import.meta.url), 'utf8')
    expect(view).toContain(':checkout-total="summaryTotal"')
    expect(view).not.toContain(':checkout-total="summaryEstimate"')
    expect(section).toContain('<StripeElementsForm ref="stripeElementsForm"')
    expect(section).not.toContain('activated'); expect(section).not.toContain('v-show=')
    expect(view).toContain('@address-reviewed="refreshCheckoutPreview"')
    expect(view).toContain('@continue="continueCheckout"')
  })
})
