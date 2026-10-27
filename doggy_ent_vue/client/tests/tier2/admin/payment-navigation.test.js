import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useAdminOrders } from '../../../src/domains/admin/composables/useAdminOrders.js'
import AdminOrdersFilters from '../../../src/domains/admin/components/AdminOrdersFilters.vue'
import AdminNotificationsView from '../../../src/domains/admin/views/AdminNotificationsView.vue'

const ordersApi = vi.hoisted(() => ({
  fetchAdminOrders: vi.fn(),
  fetchAdminOrderStats: vi.fn(),
}))
const activity = vi.hoisted(() => ({ useAdminActivity: vi.fn() }))
const notificationsApi = vi.hoisted(() => ({ fetchAdminNotifications: vi.fn() }))
vi.mock('../../../src/domains/admin/api/adminOrders.api', () => ordersApi)
vi.mock('../../../src/domains/admin/composables/useAdminActivity', () => activity)
vi.mock('../../../src/domains/admin/api/adminNotifications.api', () => notificationsApi)

let notificationState
beforeEach(() => {
  vi.resetAllMocks()
  notificationState = {
    data: ref({
      total: 1,
      sent: 0,
      failed: 0,
      mocked: 0,
      pending: 1,
      skipped: 0,
      recent: [{
        id: 'delivery-fixture',
        recipient: 'fixture@example.test',
        event: 'ORDER_CONFIRMATION',
        automatic: true,
        subject: 'Payment confirmation fixture',
        status: 'QUEUED',
        createdAt: '2026-10-26T12:00:00.000Z',
      }],
    }),
    filters: reactive({ event: 'ORDER_CONFIRMATION', status: 'QUEUED' }),
    loading: ref(false),
    error: ref(''),
    load: vi.fn(),
  }
  activity.useAdminActivity.mockReturnValue(notificationState)
})

function orderState() {
  const state = useAdminOrders()
  state.orders.value = [
    {
      id: 'order-paid',
      orderNumber: 'DGE-FIRST',
      customerName: 'Alex Morgan',
      customerEmail: 'alex@example.test',
      status: 'PAID',
      stripePaymentIntentId: 'pi_FixtureAlpha123',
    },
    {
      id: 'order-refunded',
      customerReference: 'DGE-SECOND',
      status: 'REFUNDED',
      stripePaymentIntentId: 'pi_fixtureBeta456',
    },
    { id: 'order-pending', status: 'PENDING', stripePaymentIntentId: null },
  ]
  return state
}

async function renderNotifications() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/notifications', component: AdminNotificationsView },
      { path: '/admin/email-templates', component: { render: () => null } },
    ],
  })
  await router.push('/admin/notifications')
  return renderToString(createSSRApp(AdminNotificationsView).use(router))
}

describe('admin payment identifier search', () => {
  it.each(['pi_fixturealpha123', ' PI_FIXTUREALPHA123 ', 'FiXtUrEaLpHa'])(
    'matches the stored PaymentIntent ID with query %s',
    query => {
      const state = orderState()
      state.orderSearchQuery.value = query
      expect(state.filteredOrders.value.map(order => order.id)).toEqual(['order-paid'])
      expect(ordersApi.fetchAdminOrders).not.toHaveBeenCalled()
      expect(ordersApi.fetchAdminOrderStats).not.toHaveBeenCalled()
    },
  )

  it('combines payment search with the existing status filter and clears both', () => {
    const state = orderState()
    state.orderSearchQuery.value = 'PI_FIXTURE'
    state.orderStatusFilter.value = 'REFUNDED'
    expect(state.filteredOrders.value.map(order => order.id)).toEqual(['order-refunded'])
    state.orderStatusFilter.value = 'PENDING'
    expect(state.filteredOrders.value).toEqual([])
    state.clearOrderFilters()
    expect(state.orderSearchQuery.value).toBe('')
    expect(state.orderStatusFilter.value).toBe('all')
    expect(state.filteredOrders.value).toHaveLength(3)
  })

  it.each(['DGE-FIRST', 'alex morgan', 'ALEX@EXAMPLE.TEST', 'order-paid'])(
    'preserves existing order lookup by %s',
    query => {
      const state = orderState()
      state.orderSearchQuery.value = query
      expect(state.filteredOrders.value.map(order => order.id)).toEqual(['order-paid'])
    },
  )

  it('names Stripe PaymentIntent IDs in the shared filter hint', async () => {
    const html = await renderToString(createSSRApp(AdminOrdersFilters, {
      filteredCount: 1,
      orderCount: 3,
      orderSearchQuery: '',
      orderStatusFilter: 'all',
    }))
    expect(html).toContain('Reference, Stripe PaymentIntent ID, customer, email, phone or city')
    expect(html).toContain('Showing 1 of 3 orders.')
    expect(html).toContain('Clear')
  })
})

describe('notifications template navigation', () => {
  it('renders the existing template destination alongside delivery history and filters', async () => {
    const html = await renderNotifications()
    expect(html).toMatch(/<a[^>]*href="\/admin\/email-templates"[^>]*>\s*Email templates\s*<\/a>/)
    expect(html).toContain('Delivery history')
    expect(html).toContain('Delivery status')
    expect(html).toContain('Apply filters')
    expect(html).toContain('Payment confirmation fixture')
    expect(html).toContain('Automatic receipt')
    expect(html).toContain('not confirmed inbox delivery')
    expect(html).toContain('fixture@example.test')
    expect(html).toContain('value="ORDER_CONFIRMATION"')
    expect(html).toMatch(/<option value="QUEUED" selected>/)
    for (const status of ['SENT', 'FAILED', 'MOCKED', 'PENDING', 'QUEUED', 'SKIPPED']) {
      expect(html).toContain(`value="${status}"`)
    }
    expect(html).not.toMatch(/coming in a future phase|not connected yet|Template center/i)
    expect(activity.useAdminActivity).toHaveBeenCalledWith(
      notificationsApi.fetchAdminNotifications,
      { event: '', status: '' },
      75,
    )
    expect(notificationsApi.fetchAdminNotifications).not.toHaveBeenCalled()
    expect(notificationState.load).not.toHaveBeenCalled()
  })

  it('keeps the template shortcut available when history is empty or unavailable', async () => {
    notificationState.data.value = null
    notificationState.error.value = 'Fixture history unavailable.'
    const html = await renderNotifications()
    expect(html).toContain('href="/admin/email-templates"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Fixture history unavailable.')
    expect(html).toContain('Delivery history unavailable. Apply filters to retry.')
    expect(html).not.toMatch(/coming in a future phase|not connected yet/i)
    expect(notificationsApi.fetchAdminNotifications).not.toHaveBeenCalled()
  })
})
