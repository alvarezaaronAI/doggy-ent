import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import CheckoutTotals from '../../../src/domains/checkout/OrderSummary/CheckoutTotals.vue'

const base = { summarySubtotal: 30, summaryDiscount: 0, summaryShipping: 5, summaryTax: 0, summaryTotal: 35,
  isRefreshingCheckoutPreview: false, formatPrice: value => `$${Number(value).toFixed(2)}` }
const tax = overrides => ({ provider: 'stripe', status: 'calculated', taxAmount: 2.89, ratePercent: '8.25', location: { country: 'US', city: 'Private example city', state: 'CA' }, breakdown: [], ...overrides })
const render = props => renderToString(createSSRApp(CheckoutTotals, { ...base, ...props }))

describe('compact checkout tax and promo labels', () => {
  it('shows the actual tax rate in a gray label without rendering destination or breakdown', async () => {
    const html = await render({ summaryTax: 2.89, summaryTotal: 37.89, summaryTaxDetails: tax() })
    expect(html).toContain('bg-stone-100'); expect(html).toContain('text-stone-600')
    expect(html).toContain('8.25%'); expect(html).toContain('$2.89'); expect(html).toContain('$37.89')
    expect(html).toContain('text-[#315bc5]'); expect(html).toContain('text-[var(--storefront-brand-4)]')
    for (const value of ['Private example city', 'Destination', 'Tax destination', '<details', 'setup is pending', 'Tax is not collected']) expect(html).not.toContain(value)
  })

  it('shows zero percent applied for a genuine zero charge without claiming tax exemption', async () => {
    const html = await render({ summaryTaxDetails: tax({ provider: 'none', status: 'not_configured', taxAmount: 0, ratePercent: null }) })
    expect(html).toContain('0% applied'); expect(html).toContain('$0.00')
    expect(html).not.toContain('exempt'); expect(html).not.toContain('not collected')
  })

  it.each([{ summaryTax: null, summaryTotal: null }, { isRefreshingCheckoutPreview: true }, { checkoutPreviewError: 'Fixture error' }])('does not show stale tax or promo percentages while the quote is incomplete %s', async pending => {
    const html = await render({ summaryTax: 2.89, summaryTaxDetails: tax(), summaryDiscount: 3, summaryPromo: { valid: true, discountType: 'PERCENT', discountValue: 10 }, ...pending })
    expect(html).not.toContain('8.25%')
    if (pending.isRefreshingCheckoutPreview || pending.checkoutPreviewError) expect(html).not.toContain('10% off')
  })

  it('labels a mixed-tax result as effective rather than inventing one statutory rate', async () => {
    const html = await render({ summaryTax: 2, summaryTotal: 37, summaryTaxDetails: tax({ taxAmount: 2, ratePercent: null }) })
    expect(html).toContain('5.71% effective'); expect(html).not.toContain('Private example city')
  })

  it('shows the configured percentage and the item subtotal before and after the discount', async () => {
    const html = await render({ summaryDiscount: 3, summaryTotal: 32, appliedPromoCode: 'SAVE10', summaryPromo: { valid: true, discountType: 'PERCENT', discountValue: 10 } })
    for (const value of ['SAVE10', '10% off', '-$3.00', 'Items after discount', '<s>$30.00</s>', '$27.00', '$32.00', 'Before discount', 'After discount']) expect(html).toContain(value)
    expect(html).toContain('bg-[#e8f3ec]'); expect(html).toContain('text-[#17634c]')
  })

  it('uses the configured promo percent despite ordinary cent rounding', async () => {
    const html = await render({ summarySubtotal: 10.99, summaryDiscount: 1.1, summaryPromo: { valid: true, discountType: 'PERCENT', discountValue: 10 } })
    expect(html).toContain('10% off'); expect(html).not.toContain('10.01%')
    expect(html).toContain('<s>$10.99</s>'); expect(html).toContain('$9.89')
  })

  it('labels fixed-amount discounts as effective savings, not a percent-promo rule', async () => {
    const html = await render({ summaryDiscount: 5, summaryTotal: 30, summaryPromo: { valid: true, discountType: 'FIXED', discountValue: 5 } })
    expect(html).toContain('16.67% saved'); expect(html).toContain('-$5.00'); expect(html).toContain('$25.00')
    expect(html).not.toContain('5% off')
  })

  it.each([{}, { valid: false, discountType: 'PERCENT', discountValue: 40 }, { valid: true, discountType: 'PERCENT', discountValue: 40 }])('does not trust missing or mismatched promo metadata %s', async summaryPromo => {
    const html = await render({ summaryDiscount: 3, summaryPromo })
    expect(html).toContain('10% saved'); expect(html).not.toContain('40% off')
  })

  it('omits discount detail when there is no discount and never recomputes the server total', async () => {
    const html = await render({ summaryTotal: 34.17 })
    expect(html).not.toContain('Items after discount'); expect(html).not.toContain('% saved')
    expect(html).toContain('$34.17')
  })

  it('wraps and escapes promo codes as plain text, not interactive content', async () => {
    const html = await render({ summaryDiscount: 3, appliedPromoCode: '<script>example</script>' })
    expect(html).toContain('break-words'); expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>example')
  })
})
