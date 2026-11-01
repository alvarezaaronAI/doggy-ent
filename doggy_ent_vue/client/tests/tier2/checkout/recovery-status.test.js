import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import CheckoutRecoveryStatus from '../../../src/domains/checkout/Checkout/CheckoutRecoveryStatus.vue'
import CheckoutPaymentSection from '../../../src/domains/checkout/Checkout/CheckoutPaymentSection.vue'
import CheckoutProcessingOverlay from '../../../src/domains/checkout/Checkout/CheckoutProcessingOverlay.vue'

async function render(component, props) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/checkout')
  return renderToString(createSSRApp(component, props).use(router))
}
describe('compact recovery controls preserve the payment card', () => {
  it.each(['PROCESSING', 'PAID_PENDING_ORDER', 'PAID_REVIEW'])('offers status recovery, never another charge, for %s', async status => {
    const html = await render(CheckoutRecoveryStatus, { status, canCheck: true })
    expect(html).toContain('Do not pay again'); expect(html).toContain('Check payment')
    expect(html).not.toContain('Start a new order'); expect(html).not.toContain('Cancel unpaid attempt')
    expect(html).toContain('type="button"')
  })
  it('offers explicit completed-order dismissal without clearing receipt access', async () => {
    const html = await render(CheckoutRecoveryStatus, { status: 'COMPLETED', canCheck: true, canStartNew: true })
    expect(html).toContain('Open confirmation'); expect(html).toContain('Start a new order')
  })
  it('keeps status actions outside the disabled payment fieldset and omits secure fields during paid recovery', async () => {
    const html = await render(CheckoutPaymentSection, { locked: true, checkoutTotal: 23, recovery: { visible: true, hideControls: true, status: 'PAID_REVIEW', canCheck: true } })
    expect(html).toContain('checkout-form-card'); expect(html).toContain('Payment')
    expect(html.indexOf('Check payment')).toBeLessThan(html.indexOf('<fieldset'))
    expect(html).not.toContain('Name on card'); expect(html).not.toContain('Checking wallet availability')
  })
  it('does not offer a status request without a valid saved capability', async () => {
    const html = await render(CheckoutRecoveryStatus, { message: 'Your previous order is saved.' })
    expect(html).not.toContain('Check payment')
  })
  it('uses accurate recovery progress and reduced-motion states without changing the overlay layout', async () => {
    const html = await render(CheckoutProcessingOverlay, { recovering: true })
    expect(html).toContain('Checking Your Order'); expect(html).toContain('Do not start another payment')
    expect(html).toContain('motion-reduce:animate-none')
  })
})
