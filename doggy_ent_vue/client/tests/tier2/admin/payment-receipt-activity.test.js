import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import AdminOrderEmailComposer from '../../../src/domains/admin/components/AdminOrderEmailComposer.vue'
import AdminOrderNotificationsPanel from '../../../src/domains/admin/components/AdminOrderNotificationsPanel.vue'
import AdminReportsView from '../../../src/domains/admin/views/AdminReportsView.vue'
import AdminOrdersView from '../../../src/domains/admin/views/AdminOrdersView.vue'

vi.mock('../../../src/domains/admin/api/adminEmailTemplates.api.js', () => ({ fetchEmailTemplates: vi.fn(), previewEmailTemplate: vi.fn(), sendOrderEmail: vi.fn() }))
vi.mock('../../../src/domains/admin/composables/useAdminOverview', () => ({ useAdminOverview: () => ({ activity: ref({ stats: { paidOrders: 1 }, customers: [], notifications: {} }), errors: ref([]), loading: ref(false), load: vi.fn() }) }))

async function render(component, props = {}) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/admin/orders/offline')
  return renderToString(createSSRApp(component, props).use(router))
}

describe('truthful admin receipt and operational-payment wording', () => {
  it('separates optional automatic payment receipts from manual fulfillment mail', async () => {
    const html = await render(AdminOrderEmailComposer, { order: { id: 'offline-order', emailDeliveries: [] } })
    expect(html).toContain('Payment confirmations can send automatically when enabled')
    expect(html).toContain('Preparation, shipping and other order updates require your preview and send')
    expect(html).not.toContain('No order emails send automatically')
    expect(html).not.toContain('Record dry run')
  })

  it.each([
    ['QUEUED', 'is queued'], ['PENDING', 'is being handled'], ['SENT', 'not proof of inbox delivery'],
    ['FAILED', 'needs review'], ['MOCKED', 'No email was sent'],
  ])('describes an automatic %s receipt before another manual confirmation', async (status, expected) => {
    const html = await render(AdminOrderEmailComposer, { order: { id: 'offline-order', emailDeliveries: [{ event: 'ORDER_CONFIRMATION', automatic: true, status }] } })
    expect(html).toContain(expected)
    expect(html).not.toContain('Retry receipt')
  })

  it('does not infer automatic origin for manual, legacy or nonreceipt mail', async () => {
    const html = await render(AdminOrderEmailComposer, { order: { id: 'offline-order', emailDeliveries: [{ event: 'ORDER_CONFIRMATION', status: 'SENT' }, { event: 'ORDER_SHIPPED', automatic: true, status: 'SENT' }] } })
    expect(html).not.toContain('provider accepted an automatic')
  })

  it.each(['QUEUED', 'PENDING', 'SENT', 'MOCKED', 'FAILED'])('shows the actual %s status and automatic badge without claiming delivery', async status => {
    const html = await render(AdminOrderNotificationsPanel, { deliveries: [{ id: 'offline-email', event: 'ORDER_CONFIRMATION', automatic: true, status, subject: 'Payment confirmation' }] })
    expect(html).toContain(status)
    expect(html).toContain('Automatic receipt')
    expect(html).toContain('not confirmed delivery')
    expect(html).not.toContain('Retry receipt')
  })

  it('does not label an unspecified-origin legacy message as automatic or manual', async () => {
    const html = await render(AdminOrderNotificationsPanel, { deliveries: [{ id: 'legacy', event: 'ORDER_CONFIRMATION', status: 'SENT' }] })
    expect(html).not.toContain('Automatic receipt')
    expect(html).not.toContain('Manual receipt')
  })

  it('labels operational status counts without pretending they are reconciled payments', async () => {
    const html = await render(AdminReportsView)
    expect(html).toContain('Marked paid')
    expect(html).toContain('not Stripe-reconciled payment totals')
    expect(html).not.toContain('Paid orders')
  })

  it('exposes payment-ID search and truthful workflow counts on the actual Orders page', async () => {
    const html = await render(AdminOrdersView)
    expect(html).toContain('Reference, Stripe PaymentIntent ID, customer, email, phone or city')
    expect(html).toContain('Marked paid')
  })
})
