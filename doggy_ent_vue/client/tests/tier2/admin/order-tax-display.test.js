import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import AdminOrderDetailView from '../../../src/domains/admin/views/AdminOrderDetailView.vue'

let fixtureOrder
vi.mock('../../../src/domains/admin/composables/useAdminOrderDetail', () => ({ useAdminOrderDetail: () => ({
  order: ref(fixtureOrder), loading: ref(false), trackingSaving: ref(false), statusSaving: ref(false), statusMessage: ref(''), error: ref(''),
  orderReference: ref('CE-FIXTURE'), shippingAddress: ref('Example address'), campaignAttributions: ref([]), sameCustomerOrders: ref([]),
  formatPrice: value => `$${Number(value || 0).toFixed(2)}`, formatDate: () => 'Oct 27, 2026', statusClass: () => '',
  updateStatus: vi.fn(), updateTracking: vi.fn(), refreshTracking: vi.fn(), loadOrder: vi.fn(), refreshEmailActivity: vi.fn(),
}) }))

async function render(taxDetails) {
  fixtureOrder = { id: 'fixture', orderNumber: 'CE-FIXTURE', status: 'PAID', paymentStatus: 'PAID', createdAt: '2026-10-27', subtotal: 30, discountAmount: 0, shippingAmount: 0, taxAmount: taxDetails?.taxAmount ?? 2.25, total: 32.25, items: [], taxDetails }
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/admin/orders/fixture')
  return renderToString(createSSRApp(AdminOrderDetailView).use(router))
}
const details = (overrides = {}) => ({ provider: 'stripe', status: 'calculated', taxAmount: 2.25, ratePercent: '7.5', location: { country: 'US', state: 'CA', city: 'Example City' }, breakdown: [{ label: 'State tax', ratePercent: '6', taxAmount: 1.8, taxableAmount: 30 }, { label: 'District tax', ratePercent: '1.5', taxAmount: 0.45, taxableAmount: 30 }], ...overrides })

describe('saved admin order tax display', () => {
  it('renders the saved safe tax amount, provider rate, destination and breakdown on the actual order view', async () => {
    const html = await render(details())
    for (const text of ['Tax (7.5%)', '$2.25', 'Example City, CA, United States', 'State tax', '(6%)', 'District tax', '(1.5%)']) expect(html).toContain(text)
  })
  it('does not derive a historical or combined rate for legacy/null and mixed-rate details', async () => {
    const legacy = await render(null)
    expect(legacy).toContain('$2.25'); expect(legacy).toContain('were not saved for this order'); expect(legacy).not.toContain('7.5%')
    const mixed = await render(details({ ratePercent: null }))
    expect(mixed).toContain('No single tax rate was supplied.'); expect(mixed).not.toContain('7.5%')
  })
  it('labels a saved disabled configuration as setup pending, without claiming exemption or a zero rate', async () => {
    const html = await render(details({ provider: 'none', status: 'not_configured', taxAmount: 0, ratePercent: null, breakdown: [] }))
    expect(html).toContain('Tax was not collected. Tax collection setup was pending for this order.')
    expect(html).not.toContain('0%'); expect(html).not.toContain('exempt')
  })
})
