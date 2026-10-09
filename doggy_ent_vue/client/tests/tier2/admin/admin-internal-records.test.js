import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getStripePaymentLink,
  normalizeStripeDashboardPaymentsUrl,
} from '../../../src/domains/admin/utils/stripeDashboard.js'
import { getOrderValueTier } from '../../../src/domains/admin/utils/adminOrders.utils.js'
import { useAdminCustomers } from '../../../src/domains/admin/composables/useAdminCustomers.js'

const api = vi.hoisted(() => ({
  fetchAdminOrderById: vi.fn(),
  updateAdminOrderStatus: vi.fn(),
  updateAdminOrderTracking: vi.fn(),
  refreshAdminOrderTracking: vi.fn(),
  resendAdminOrderEmail: vi.fn(),
}))
vi.mock('../../../src/domains/admin/api/adminOrders.api', () => api)
const { useAdminOrderDetail } =
  await import('../../../src/domains/admin/composables/useAdminOrderDetail.js')

beforeEach(() => vi.resetAllMocks())
describe('admin payment dashboard links', () => {
  it('links the stored PaymentIntent to an account-scoped test or live base', () => {
    expect(
      getStripePaymentLink(
        'pi_fixture123',
        'https://dashboard.stripe.com/acct_fixture/test/payments/',
      ),
    ).toBe(
      'https://dashboard.stripe.com/acct_fixture/test/payments/pi_fixture123',
    )
    expect(
      getStripePaymentLink(
        'pi_fixture123',
        'https://dashboard.stripe.com/payments',
      ),
    ).toBe('https://dashboard.stripe.com/payments/pi_fixture123')
  })
  it('never creates an unsafe or guessed payment link', () => {
    for (const url of [
      undefined,
      '',
      'https://evil.example/payments',
      'javascript:alert(1)',
      'http://dashboard.stripe.com/payments',
      'https://dashboard.stripe.com.evil.example/payments',
      'https://dashboard.stripe.com/payments?token=fixture',
      'https://dashboard.stripe.com/payments#fragment',
      'https://user:password@dashboard.stripe.com/payments',
      'https://dashboard.stripe.com/payments/pi_old',
    ]) {
      expect(normalizeStripeDashboardPaymentsUrl(url)).toBe('')
      expect(getStripePaymentLink('pi_fixture123', url)).toBeNull()
    }
    for (const id of [
      null,
      '',
      'i_wrongPrefix',
      'ch_fixture',
      'pi_fixture/other',
      'pi_fixture_secret_value',
    ]) {
      expect(
        getStripePaymentLink(id, 'https://dashboard.stripe.com/test/payments'),
      ).toBeNull()
    }
  })
  it('persists a public base, preserves cancel by not saving, and rejects unsafe values', async () => {
    const storage = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    })
    try {
      const { useAdminStripeDashboard } =
        await import('../../../src/domains/admin/composables/useAdminStripeDashboard.js')
      const settings = useAdminStripeDashboard()
      settings.saveUrl('https://dashboard.stripe.com/test/payments/')
      expect(settings.paymentsUrl.value).toBe(
        'https://dashboard.stripe.com/test/payments',
      )
      expect(() => settings.saveUrl('https://evil.example/payments')).toThrow(
        'HTTPS Stripe',
      )
      expect(settings.paymentsUrl.value).toBe(
        'https://dashboard.stripe.com/test/payments',
      )
      settings.saveUrl('https://dashboard.stripe.com/payments')
      expect(storage.get('doggy-admin-stripe-payments-url')).toBe(
        'https://dashboard.stripe.com/payments',
      )
      settings.saveUrl('')
      expect(settings.paymentsUrl.value).toBe('')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('restored order-value tiers', () => {
  it('keeps small badge text at a contrast ratio of at least 4.5 against its tinted surface', () => {
    const luminance = (rgb) => rgb.map((channel) => channel / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
    for (const total of [0, 100, 200, 350, 500]) {
      const foreground = getOrderValueTier({ total }).color.slice(1).match(/../g).map((channel) => parseInt(channel, 16))
      const surface = foreground.map((channel) => channel * 0.1 + 255 * 0.9)
      expect((luminance(surface) + 0.05) / (luminance(foreground) + 0.05)).toBeGreaterThanOrEqual(4.5)
    }
  })
  it('keeps the original thresholds and distinct readable labels/colors', () => {
    const totals = [0, 99.99, 100, 199.99, 200, 349.99, 350, 499.99, 500]
    const labels = [
      'Standard',
      'Standard',
      'Gold',
      'Gold',
      'Platinum',
      'Platinum',
      'Diamond',
      'Diamond',
      'Gem',
    ]
    totals.forEach((total, index) =>
      expect(getOrderValueTier({ total }).label).toContain(labels[index]),
    )
    expect(
      new Set(
        [0, 100, 200, 350, 500].map(
          (total) => getOrderValueTier({ total }).color,
        ),
      ).size,
    ).toBe(5)
  })
})

describe('unique customer lookup', () => {
  it('distinguishes customers with the same name by email or full ID', () => {
    const state = useAdminCustomers()
    state.customers.value = [
      { id: 'user-1', name: 'Alex Morgan', email: 'alex.one@example.com' },
      { id: 'user-2', name: 'Alex Morgan', email: 'alex.two@example.com' },
    ]
    state.searchQuery.value = ' USER-2 '
    expect(
      state.filteredCustomers.value.map((customer) => customer.id),
    ).toEqual(['user-2'])
    state.searchQuery.value = 'alex.one@'
    expect(
      state.filteredCustomers.value.map((customer) => customer.id),
    ).toEqual(['user-1'])
  })
})

describe('admin internal record freshness', () => {
  it('refreshes the protected full record after an explicit status save', async () => {
    const detail = useAdminOrderDetail('order-1')
    detail.order.value = {
      id: 'order-1',
      status: 'PAID',
      internalRecord: { order: { status: 'PAID' } },
    }
    api.updateAdminOrderStatus.mockResolvedValue({
      id: 'order-1',
      status: 'SHIPPED',
    })
    api.fetchAdminOrderById.mockResolvedValue({
      id: 'order-1',
      status: 'SHIPPED',
      internalRecord: { order: { status: 'SHIPPED' } },
    })
    await detail.updateStatus({ status: 'SHIPPED', note: 'Fixture' })
    expect(api.updateAdminOrderStatus).toHaveBeenCalledTimes(1)
    expect(api.fetchAdminOrderById).toHaveBeenCalledWith('order-1')
    expect(detail.order.value.internalRecord.order.status).toBe('SHIPPED')
  })
  it('does not present a failed read as a failed write or retain a stale record', async () => {
    const detail = useAdminOrderDetail('order-1')
    detail.order.value = {
      id: 'order-1',
      status: 'PAID',
      internalRecord: { order: { status: 'PAID' } },
    }
    api.updateAdminOrderStatus.mockResolvedValue({
      id: 'order-1',
      status: 'SHIPPED',
    })
    api.fetchAdminOrderById.mockRejectedValue(new Error('Unavailable'))
    await detail.updateStatus({ status: 'SHIPPED' })
    expect(detail.order.value.status).toBe('SHIPPED')
    expect(detail.order.value.internalRecord).toBeNull()
    expect(detail.statusMessage.value).toContain(
      'Order updated. Internal details could not be refreshed',
    )
    expect(api.updateAdminOrderStatus).toHaveBeenCalledTimes(1)
  })
})
