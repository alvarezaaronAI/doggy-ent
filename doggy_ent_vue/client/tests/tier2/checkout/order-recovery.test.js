import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import OrderSuccessView from '../../../src/domains/checkout/views/OrderSuccessView.vue'

vi.mock('../../../src/domains/checkout/composables/useOrderConfirmation.js', () => ({
  useOrderConfirmation: () => ({ order: ref(null), loading: ref(false), error: ref('PRIVATE_PROVIDER_DETAIL'), load: vi.fn() }),
}))

describe('order recovery keeps the receipt boundary safe', () => {
  it('shows generic reassurance and existing recovery actions, never diagnostics or another payment action', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
    await router.push('/order-success/pending')
    const html = await renderToString(createSSRApp(OrderSuccessView).use(router))
    expect(html).toContain('Order details unavailable')
    expect(html).toContain('do not pay again')
    expect(html).toContain('href="/account/orders"')
    expect(html).toContain('Try again')
    expect(html).toContain('storefront-ui store-pattern flex-1')
    expect(html).not.toContain('PRIVATE_PROVIDER_DETAIL')
    expect(html).not.toContain('>404</p>')
    expect(html).not.toContain('Complete Secure Order')
  })
})
