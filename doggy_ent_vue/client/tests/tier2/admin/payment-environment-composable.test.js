import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, nextTick } from 'vue'

const api = vi.hoisted(() => ({ fetchAdminPaymentEnvironment: vi.fn() }))
vi.mock('../../../src/domains/admin/api/adminPayments.api.js', () => api)
import { useAdminPaymentEnvironment } from '../../../src/domains/admin/composables/useAdminPaymentEnvironment.js'

const apps = []
let documentState
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await nextTick() }
function fixture(overrides = {}) {
  return {
    mode: 'sandbox', keyMode: 'sandbox', paymentsEnabled: true,
    canCreatePayments: true, livePaymentsSupported: false, verification: 'verified',
    accountId: 'acct_fixture', expectedAccountId: 'acct_fixture', chargesEnabled: true,
    checkedAt: new Date().toISOString(), blockers: [], ...overrides,
  }
}
function mount() {
  let state
  const renderer = createRenderer({ createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {} })
  const app = renderer.createApp({ setup() { state = useAdminPaymentEnvironment(); return () => null } })
  app.mount({})
  apps.push(app)
  return { state, app }
}
function visibility(hidden) {
  documentState.hidden = hidden
  documentState.addEventListener.mock.calls.find(([name]) => name === 'visibilitychange')[1]()
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-26T18:00:00.000Z'))
  documentState = { hidden: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('document', documentState)
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request') }))
  api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture())
})
afterEach(() => {
  for (const app of apps.splice(0)) app.unmount()
  expect(vi.getTimerCount()).toBe(0)
  expect(fetch).not.toHaveBeenCalled()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('admin payment environment state', () => {
  it('starts unknown while loading, then separates configuration from verified account identity', async () => {
    const { state } = mount()
    expect(state.loading.value).toBe(true)
    expect(state.modeLabel.value).toBe('Mode unknown')
    expect(state.verificationLabel.value).toBe('Checking account...')
    expect(state.paymentsLabel.value).toBe('Unknown')
    await flush()
    expect(state.modeLabel.value).toBe('Configured Sandbox')
    expect(state.verificationLabel.value).toBe('Account verified')
    expect(state.paymentsLabel.value).toBe('Allowed (sandbox)')
  })

  it.each([
    [{ mode: 'live', keyMode: 'live', canCreatePayments: false }, 'Configured Live', 'Account verified', 'Paused'],
    [{ mode: 'unconfigured', keyMode: 'unconfigured', verification: 'unverified', accountId: null, expectedAccountId: null, checkedAt: null, canCreatePayments: false }, 'Configured Unset', 'Account unverified', 'Paused'],
    [{ verification: 'failed', accountId: null, canCreatePayments: false }, 'Configured Sandbox', 'Account check failed', 'Paused'],
    [{ verification: 'unverified', accountId: null, canCreatePayments: false }, 'Configured Sandbox', 'Account unverified', 'Paused'],
    [{ paymentsEnabled: false }, 'Configured Sandbox', 'Account verified', 'Paused'],
  ])('describes configuration, verification and permission independently: %j', async (overrides, mode, verification, permission) => {
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture(overrides))
    const { state } = mount(); await flush()
    expect(state.modeLabel.value).toBe(mode)
    expect(state.verificationLabel.value).toBe(verification)
    expect(state.paymentsLabel.value).toBe(permission)
  })

  it.each([
    { mode: 'live' }, { keyMode: 'live' }, { verification: 'unverified' },
    { accountId: null }, { expectedAccountId: 'acct_different' },
    { chargesEnabled: null }, { blockers: [{ code: 'MISMATCH', message: 'Account mismatch.' }] },
  ])('does not show allowed for contradictory server data: %j', async overrides => {
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture(overrides))
    const { state } = mount(); await flush()
    expect(state.paymentsLabel.value).toBe('Unknown')
  })

  it('deduplicates refreshes and visibility events during an in-flight request', async () => {
    let resolve
    api.fetchAdminPaymentEnvironment.mockReturnValue(new Promise(done => { resolve = done }))
    const { state } = mount()
    const pending = state.refresh()
    expect(state.refresh()).toBe(pending)
    vi.advanceTimersByTime(60_000)
    visibility(false); visibility(false)
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(1)
    resolve(fixture()); await pending
    expect(state.paymentsLabel.value).toBe('Allowed (sandbox)')
  })

  it('expires the server check without polling, and throttles visible-tab rechecks', async () => {
    const { state } = mount(); await flush()
    visibility(true)
    vi.advanceTimersByTime(59_999)
    visibility(false)
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(state.stale.value).toBe(true)
    expect(state.verificationLabel.value).toBe('Stale check')
    expect(state.paymentsLabel.value).toBe('Unknown')
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture())
    visibility(false); visibility(false); await flush()
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(2)
    expect(state.current.value).toBe(true)
    vi.advanceTimersByTime(120_000)
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(2)
    expect(state.current.value).toBe(false)
  })

  it.each(['2026-10-26T17:59:00.000Z', '2026-10-26T18:01:00.000Z'])('does not certify an expired or future check time: %s', async checkedAt => {
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture({ checkedAt }))
    const { state } = mount(); await flush()
    expect(state.stale.value).toBe(true)
    expect(state.paymentsLabel.value).toBe('Unknown')
  })

  it.each([{ checkedAt: null }, { expectedAccountId: 'acct_different' }])('does not certify a verified account without a check time and matching identity: %j', async overrides => {
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture(overrides))
    const { state } = mount(); await flush()
    expect(state.accountVerified.value).toBe(false)
    expect(state.verificationLabel.value).toBe('Account unverified')
    expect(state.paymentsLabel.value).toBe('Unknown')
  })

  it('uses the server check age, not just the response arrival time', async () => {
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture({ checkedAt: '2026-10-26T17:59:15.000Z' }))
    const { state } = mount(); await flush()
    vi.advanceTimersByTime(15_000)
    expect(state.stale.value).toBe(true)
  })

  it('keeps failed refresh data historical, redacts raw errors and recovers on refresh', async () => {
    const { state } = mount(); await flush()
    api.fetchAdminPaymentEnvironment.mockRejectedValue(new Error('private provider error'))
    await state.refresh()
    expect(state.modeLabel.value).toBe('Last configured Sandbox')
    expect(state.verificationLabel.value).toBe('Check unavailable')
    expect(state.error.value).not.toContain('private provider error')
    expect(state.paymentsLabel.value).toBe('Unknown')
    visibility(false)
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(2)
    api.fetchAdminPaymentEnvironment.mockResolvedValue(fixture({ paymentsEnabled: false, canCreatePayments: false }))
    await state.refresh()
    expect(state.error.value).toBe('')
    expect(state.paymentsLabel.value).toBe('Paused')
  })

  it('shows unknown on initial failure rather than assuming sandbox or paused', async () => {
    api.fetchAdminPaymentEnvironment.mockRejectedValue(new Error('Offline'))
    const { state } = mount(); await flush()
    expect(state.modeLabel.value).toBe('Mode unknown')
    expect(state.paymentsLabel.value).toBe('Unknown')
    expect(state.error.value).toContain('unavailable')
  })

  it('defers a hidden-tab initial read until visible and cleans listeners/timers', async () => {
    documentState.hidden = true
    const { app } = mount()
    expect(api.fetchAdminPaymentEnvironment).not.toHaveBeenCalled()
    visibility(false); await flush()
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(1)
    app.unmount(); apps.pop()
    expect(documentState.removeEventListener).toHaveBeenCalledWith('visibilitychange', documentState.addEventListener.mock.calls[0][1])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('aborts on unmount and ignores a late response without scheduling more work', async () => {
    let resolve
    api.fetchAdminPaymentEnvironment.mockReturnValue(new Promise(done => { resolve = done }))
    const { state, app } = mount()
    const { signal } = api.fetchAdminPaymentEnvironment.mock.calls[0][0]
    app.unmount(); apps.pop()
    expect(signal.aborted).toBe(true)
    resolve(fixture()); await flush()
    expect(state.environment.value).toBeNull()
    await state.refresh()
    visibility(false)
    expect(api.fetchAdminPaymentEnvironment).toHaveBeenCalledTimes(1)
  })
})
