import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import TaxBreakdown from '../../../src/domains/checkout/components/TaxBreakdown.vue'
import CheckoutTotals from '../../../src/domains/checkout/OrderSummary/CheckoutTotals.vue'
import CheckoutShippingSection from '../../../src/domains/checkout/Checkout/CheckoutShippingSection.vue'
import OrderConfirmationContent from '../../../src/domains/checkout/OrderSuccess/OrderConfirmationContent.vue'
import AccountOrderDetails from '../../../src/domains/account/components/AccountOrderDetails.vue'
import { formatTaxRate, isUsableCheckoutPricing, mapTaxDetails } from '../../../src/domains/checkout/mappers/taxDetails.mapper.js'
import { US_SHIPPING_STATES, isUSShippingDestination } from '../../../src/domains/checkout/constants/shippingDestinations.js'
import { commercePresentation } from '../../../src/domains/storefront/content/commercePresentation.js'

const money = value => `$${Number(value).toFixed(2)}`
const details = (overrides = {}) => ({
  provider: 'stripe', status: 'calculated', taxAmount: 2.25, ratePercent: '7.5',
  location: { country: 'US', state: 'CA', city: 'Example City' },
  breakdown: [{ label: 'State tax', ratePercent: '6', taxAmount: 1.8, taxableAmount: 30 },
    { label: 'District tax', ratePercent: '1.5', taxAmount: 0.45, taxableAmount: 30 }],
  ...overrides,
})
const pricing = (overrides = {}) => ({ subtotal: 30, discountAmount: 0, shippingAmount: 0, taxAmount: 2.25, total: 32.25, ...overrides })

async function render(component, props) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/')
  return renderToString(createSSRApp(component, props).use(router))
}

describe('safe server tax presentation', () => {
  it.each([null, undefined, {}, { provider: 'other' }, { ...details(), taxAmount: -1 }])('handles missing or invalid details without inventing a rate: %s', value => {
    expect(mapTaxDetails(value)).toBeNull()
  })

  it('maps only public presentation fields, never private references or unknown reasons', () => {
    const result = mapTaxDetails(details({ calculationId: 'PRIVATE_REFERENCE',
      breakdown: [{ label: 'State tax', ratePercent: null, taxAmount: 0, taxableAmount: 30, taxabilityReason: 'PRIVATE_REASON', reference: 'PRIVATE_REFERENCE' }] }))
    expect(JSON.stringify(result)).not.toContain('PRIVATE_')
    expect(result.breakdown[0]).toEqual({ label: 'State tax', rate: null, taxAmount: 0, taxableAmount: 30, reason: '' })
    expect(mapTaxDetails(details({ breakdown: [{ label: 'State', ratePercent: null, taxAmount: 0, taxableAmount: 30, taxabilityReason: '__proto__' }] })).breakdown[0].reason).toBe('')
  })

  it.each([null, undefined, '', 0, 'NaN', '-1', '101', '<script>'])('does not invent a rate from an invalid/null rate %s', value => {
    expect(formatTaxRate(value)).toBeNull()
  })

  it('uses explicit supplied rates including zero, not division of order amounts', () => {
    expect(formatTaxRate('7.2500')).toBe('7.25%')
    expect(formatTaxRate('0')).toBe('0%')
    expect(mapTaxDetails(details({ ratePercent: null })).rate).toBeNull()
  })

  it('renders a native keyboard disclosure with destination, jurisdiction rates, and taxable amounts', async () => {
    const html = await render(TaxBreakdown, { taxDetails: details(), taxAmount: 2.25, formatPrice: money })
    for (const value of ['<details', '<summary', 'Tax destination &amp; breakdown', 'Example City, CA, United States', 'State tax', '(6%)', 'District tax', '(1.5%)', '$1.80', '$0.45', 'Taxable amount: $30.00']) expect(html).toContain(value)
    expect(html).not.toContain('animate-')
  })

  it('keeps mixed/null rates separate without deriving an effective percentage', async () => {
    const html = await render(TaxBreakdown, { taxDetails: details({ ratePercent: null }), taxAmount: 2.25, formatPrice: money })
    expect(html).toContain('No single tax rate was supplied.')
    expect(html).toContain('(6%)'); expect(html).toContain('(1.5%)')
    expect(html).not.toContain('7.5%')
  })

  it('says setup pending and not collected for the disabled configuration, not exempt or zero percent', async () => {
    const html = await render(TaxBreakdown, { taxDetails: details({ provider: 'none', status: 'not_configured', taxAmount: 0, ratePercent: null, breakdown: [] }), taxAmount: 0, formatPrice: money })
    expect(html).toContain('Tax is not being collected. Tax collection setup is pending.')
    expect(html).not.toContain('0%'); expect(html).not.toContain('exempt')
  })

  it('explains incomplete addresses and non-collection distinctly', async () => {
    const pending = await render(TaxBreakdown, { taxDetails: details({ status: 'pending_address', taxAmount: 0, ratePercent: null, breakdown: [] }), formatPrice: money })
    expect(pending).toContain('Enter your complete US shipping address')
    const notCollecting = await render(TaxBreakdown, { taxDetails: details({ status: 'not_collecting', taxAmount: 0, ratePercent: null, breakdown: [] }), taxAmount: 0, formatPrice: money })
    expect(notCollecting).toContain('Tax is not collected for this destination.')
    expect(notCollecting).not.toContain('setup is pending'); expect(notCollecting).not.toContain('exempt')
  })

  it('explains calculated zero only with the actual supplied reason', async () => {
    const html = await render(TaxBreakdown, { taxDetails: details({ taxAmount: 0, ratePercent: null, breakdown: [{ label: 'State tax', taxAmount: 0, taxableAmount: 30, ratePercent: null, taxabilityReason: 'product_exempt' }] }), taxAmount: 0, formatPrice: money })
    expect(html).toContain('calculation returned no tax to collect')
    expect(html).toContain('Product exemption applied.')
    expect(html).not.toContain('0%')
  })

  it('hides stale amounts, rates and destinations while totals are pending or failed', async () => {
    const html = await render(CheckoutTotals, { summarySubtotal: 30, summaryDiscount: 0, summaryShipping: 5, summaryTax: null, summaryTotal: null, checkoutPreviewError: 'Tax and order total could not be updated. Retry before paying.', isRefreshingCheckoutPreview: false, formatPrice: money })
    expect(html).toContain('Estimated total'); expect(html).toContain('Pending')
    expect(html).toContain('role="alert"'); expect(html).toContain('Retry order total')
    expect(html).not.toContain('$0.00'); expect(html).not.toContain('$2.25')
    const refreshing = await render(TaxBreakdown, { taxDetails: details(), taxAmount: 2.25, pending: true, formatPrice: money })
    expect(refreshing).not.toContain('Example City'); expect(refreshing).not.toContain('7.5%')
  })

  it('shows server tax amount/rate and total without recomputing them', async () => {
    const html = await render(CheckoutTotals, { summarySubtotal: 30, summaryDiscount: 0, summaryShipping: 5, summaryTax: 2.25, summaryTaxDetails: details(), summaryTotal: 37.25, isRefreshingCheckoutPreview: false, formatPrice: money })
    expect(html).toContain('7.5%'); expect(html).toContain('bg-stone-100'); expect(html).toContain('$2.25'); expect(html).toContain('$37.25')
    expect(html).not.toContain('Tax destination'); expect(html).not.toContain('Example City')
  })

  it.each([OrderConfirmationContent, AccountOrderDetails])('uses saved order details and leaves legacy amounts without historical rate inference', async component => {
    const order = { orderNumber: 'CE-FIXTURE', createdAt: '2026-10-27', status: 'PAID', paymentStatus: 'PAID', items: [], subtotal: 30, shippingAmount: 0, taxAmount: 2.25, total: 32.25, taxDetails: null }
    const props = { order, settings: commercePresentation().confirmation }
    const legacy = await render(component, props)
    expect(legacy).toContain('$2.25'); expect(legacy).toContain('were not saved for this order')
    expect(legacy).not.toContain('7.5%'); expect(legacy).not.toContain('setup was pending')
    const saved = await render(component, { ...props, order: { ...order, taxDetails: details({ ratePercent: null }) } })
    expect(saved).toContain('Example City'); expect(saved).toContain('State tax'); expect(saved).not.toContain('7.5%')
  })
})

describe('trusted pricing validation', () => {
  it('accepts optional legacy details but requires numeric server totals', () => {
    expect(isUsableCheckoutPricing(pricing())).toBe(true)
    expect(isUsableCheckoutPricing(pricing({ taxDetails: null }))).toBe(true)
    expect(isUsableCheckoutPricing(pricing({ taxDetails: details() }))).toBe(true)
    for (const value of [null, {}, pricing({ total: NaN }), pricing({ taxAmount: '2.25' }), pricing({ total: -1 })]) expect(isUsableCheckoutPricing(value)).toBe(false)
  })
  it('rejects malformed, inconsistent or nonzero uncalculated tax details', () => {
    for (const taxDetails of [{}, details({ taxAmount: 1 }), details({ status: 'not_configured' }), details({ status: 'pending_address' }), details({ status: 'not_collecting' })]) {
      expect(isUsableCheckoutPricing(pricing({ taxDetails }))).toBe(false)
    }
    expect(isUsableCheckoutPricing(pricing({ taxAmount: 0, total: 30, taxDetails: details({ provider: 'none', status: 'not_configured', taxAmount: 0, ratePercent: null, breakdown: [] }) }))).toBe(true)
  })
})

describe('US shipping catalogue, independent of taxes', () => {
  it('has exactly 50 states plus DC and excludes territories and foreign destinations', () => {
    expect(US_SHIPPING_STATES).toHaveLength(51)
    expect(new Set(US_SHIPPING_STATES.map(state => state.code)).size).toBe(51)
    for (const state of US_SHIPPING_STATES) expect(isUSShippingDestination({ country: 'US', state: state.code })).toBe(true)
    for (const customer of [{ country: 'CA', state: 'ON' }, { country: 'US', state: 'PR' }, { country: 'US', state: '' }]) expect(isUSShippingDestination(customer)).toBe(false)
  })
  it('uses one native US country option and all shipping states without altering saved foreign data', async () => {
    const customer = { country: 'CA', state: 'ON', address2: 'Unit 2' }
    const html = await render(CheckoutShippingSection, { customer })
    expect(html).toMatch(/<option value="US"[^>]*>United States<\/option>/)
    expect(html).not.toContain('>Canada</option>'); expect(html).toContain('District of Columbia'); expect(html).toContain('Wyoming')
    expect(html).toContain('Your saved address is unchanged.')
    expect(customer).toEqual({ country: 'CA', state: 'ON', address2: 'Unit 2' })
  })
})
