import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'

const composable = vi.hoisted(() => ({ useAdminPaymentEnvironment: vi.fn() }))
vi.mock('../../../src/domains/admin/composables/useAdminPaymentEnvironment.js', () => composable)
import AdminPaymentEnvironment from '../../../src/domains/admin/components/AdminPaymentEnvironment.vue'
import AdminLayout from '../../../src/domains/admin/components/AdminLayout.vue'

function fixture(overrides = {}) {
  return {
    mode: 'sandbox', keyMode: 'sandbox', paymentsEnabled: true,
    canCreatePayments: true, livePaymentsSupported: false, verification: 'verified',
    accountId: 'acct_fixture', expectedAccountId: 'acct_fixture', chargesEnabled: true,
    checkedAt: '2026-10-26T18:00:00.000Z', blockers: [], ...overrides,
  }
}
function setup(overrides = {}) {
  const values = {
    environment: fixture(), loading: false, error: '', stale: false, current: true, accountVerified: true,
    modeLabel: 'Configured Sandbox', verificationLabel: 'Account verified', paymentsLabel: 'Paused',
    ...overrides,
  }
  const state = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, ref(value)]))
  state.refresh = vi.fn()
  composable.useAdminPaymentEnvironment.mockReturnValue(state)
  return state
}
const render = () => renderToString(createSSRApp(AdminPaymentEnvironment))

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request') }))
  setup()
})
afterEach(() => {
  expect(fetch).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
})

describe('compact read-only payment environment UI', () => {
  it('shows configured mode separately from account identity and exposes safe details', async () => {
    const html = await render()
    expect(html).toContain('Configured Sandbox')
    expect(html).toContain('Account verified')
    expect(html).toContain('Expected Stripe account')
    expect(html).toContain('acct_fixture')
    expect(html).toContain('Verified Stripe account (last check)')
    expect(html).toContain('New payments')
    expect(html).toContain('Paused')
    expect(html).toContain('datetime="2026-10-26T18:00:00.000Z"')
    expect(html).toContain('Live charging is locked until launch checks pass.')
    expect(html).toContain('New payments paused')
    expect(html).toContain('None reported.')
  })

  it('uses a labelled Lucide refresh button with a tooltip as its only action', async () => {
    const html = await render()
    expect(html).toContain('aria-label="Refresh payment environment"')
    expect(html).toContain('title="Refresh payment environment"')
    expect(html).toContain('<svg')
    expect(html.match(/<button\b/g)).toHaveLength(1)
    expect(html).not.toMatch(/<input|<select|<a\s|role="switch"|Refund|Enable payments/)
  })

  it('does not issue a refresh during server rendering', async () => {
    const state = setup()
    await render()
    expect(state.refresh).not.toHaveBeenCalled()
  })

  it.each([
    { environment: null, current: false, modeLabel: 'Mode unknown', verificationLabel: 'Account unknown', paymentsLabel: 'Unknown' },
    { loading: true, current: false, verificationLabel: 'Checking account...', paymentsLabel: 'Unknown' },
    { stale: true, current: false, modeLabel: 'Last configured Sandbox', verificationLabel: 'Stale check', paymentsLabel: 'Unknown' },
    { error: 'Payment environment unavailable. New-payment status is unknown.', current: false, verificationLabel: 'Check unavailable', paymentsLabel: 'Unknown' },
  ])('makes unknown/loading/stale/unavailable states explicit without success color: %j', async values => {
    setup(values)
    const html = await render()
    expect(html).toContain(values.verificationLabel)
    expect(html).toContain('Unknown')
    expect(html).not.toContain('text-[var(--admin-accent)]')
    expect(html).not.toContain('None reported.')
    expect(html).toContain('Current blockers unknown.')
    if (values.loading) {
      expect(html).toContain('aria-busy="true"')
      expect(html).toContain(' disabled')
      expect(html).toContain('motion-safe:animate-spin')
    }
    if (values.stale) expect(html).toContain('Check is stale.')
    if (values.error) expect(html).toContain('role="alert"')
  })

  it('shows live configuration as a caution and renders blockers as escaped text', async () => {
    setup({
      environment: fixture({ mode: 'live', keyMode: 'live', verification: 'failed', accountId: null, blockers: [{ code: 'LIVE_BLOCKED', message: 'Live disabled <script>alert(1)</script>' }] }),
      modeLabel: 'Configured Live', verificationLabel: 'Account check failed', accountVerified: false,
    })
    const html = await render()
    expect(html).toContain('Configured Live')
    expect(html).toContain('text-red-800')
    expect(html).toContain('Account check failed')
    expect(html).toContain('Not verified')
    expect(html).toContain('Live disabled &lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('exposes both expected and returned account IDs on mismatch without calling the returned account verified', async () => {
    setup({
      environment: fixture({ verification: 'failed', accountId: 'acct_other', blockers: [{ code: 'ACCOUNT_MISMATCH', message: 'Stripe returned a different account.' }] }),
      verificationLabel: 'Account check failed', accountVerified: false,
    })
    const html = await render()
    expect(html).toContain('acct_fixture')
    expect(html).toContain('acct_other')
    expect(html).toContain('Stripe account returned (not verified)')
    expect(html).not.toContain('Verified Stripe account (last check)')
    expect(html).not.toContain('text-[var(--admin-accent)]')
  })

  it('supports unset configuration, absent checks and null charge status', async () => {
    setup({
      environment: fixture({ mode: 'unconfigured', keyMode: 'unconfigured', verification: 'unverified', accountId: null, expectedAccountId: null, checkedAt: null, chargesEnabled: null }),
      modeLabel: 'Configured Unset', verificationLabel: 'Account unverified', accountVerified: false,
    })
    const html = await render()
    expect(html).toContain('Configured Unset')
    expect(html).toContain('Not set')
    expect(html).toContain('Not checked')
    expect(html).toContain('Unknown')
    expect(html).not.toContain('Account verified</span>')
  })

  it('keeps long identifiers/messages wrappable and places disclosure in shared context, not navigation', async () => {
    const html = await render()
    expect(html).toContain('minmax(0,1fr)')
    expect(html).toContain('break-all')
    expect(html).toContain('sm:grid-cols-2')
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
    await router.push('/admin/orders')
    const layout = await renderToString(createSSRApp(AdminLayout).use(router))
    expect(layout.indexOf('Configured Sandbox')).toBeGreaterThan(layout.indexOf('class="admin-context"'))
    expect(layout.indexOf('Configured Sandbox')).toBeLessThan(layout.indexOf('class="admin-body"'))
    expect(layout.slice(layout.indexOf('<aside'), layout.indexOf('</aside>'))).not.toContain('Configured Sandbox')
  })
})
