import { describe, expect, it, vi } from 'vitest'
import { getPaymentConfig, assertPaymentRequestMode, LIVE_PAYMENTS_SUPPORTED } from '../../../src/domains/payments/config/payment.config.js'
import { createPaymentEnvironmentService } from '../../../src/domains/payments/services/paymentEnvironment.service.js'

const sandbox = { PAYMENT_MODE: 'sandbox', PAYMENTS_ENABLED: 'true', STRIPE_SECRET_KEY: 'rk_test_syntheticOnly123', STRIPE_EXPECTED_ACCOUNT_ID: 'acct_sandboxFixture' }

function fixture(overrides = {}) {
  let time = Date.parse('2026-10-26T12:00:00Z')
  const env = { ...sandbox, ...overrides }
  const retrieve = vi.fn().mockResolvedValue({ id: env.STRIPE_EXPECTED_ACCOUNT_ID, charges_enabled: true })
  const client = { accounts: { retrieve }, paymentIntents: { create: vi.fn(), retrieve: vi.fn() } }
  const createClient = vi.fn(() => client)
  const service = createPaymentEnvironmentService({ readConfig: () => getPaymentConfig(env), createClient, now: () => time })
  return { env, retrieve, client, createClient, service, advance: ms => { time += ms } }
}

describe('strict payment environment configuration', () => {
  it('defaults to disabled and unconfigured, not an implicit live environment', () => {
    const config = getPaymentConfig({})
    expect(config).toMatchObject({ mode: 'unconfigured', keyMode: 'unconfigured', enabled: false, expectedAccountId: null })
    expect(() => assertPaymentRequestMode('sandbox', config)).toThrow('temporarily unavailable')
  })

  it.each(['sk', 'rk'])('accepts a %s sandbox credential without exposing it in messages', prefix => {
    const config = getPaymentConfig({ ...sandbox, STRIPE_SECRET_KEY: `${prefix}_test_syntheticOnly123` })
    expect(config.issues).toEqual([])
    expect(config.keyMode).toBe('sandbox')
  })

  it.each(['TRUE', '1', 'yes', '', ' true '])('rejects an ambiguous enable flag %j', PAYMENTS_ENABLED => {
    const config = getPaymentConfig({ ...sandbox, PAYMENTS_ENABLED })
    expect(config.enabled).toBe(false)
    expect(config.issues).toContainEqual(expect.objectContaining({ code: 'INVALID_ENABLE_FLAG' }))
  })

  it.each(['pk_test_privateCanary', 'sk_test_', ' sk_test_privateCanary', 'sk_live_privateCanary', 'privateCanary'])('fails closed on an invalid or wrong-mode credential', STRIPE_SECRET_KEY => {
    const config = getPaymentConfig({ ...sandbox, STRIPE_SECRET_KEY })
    expect(config.issues.length).toBeGreaterThan(0)
    expect(JSON.stringify(config.issues)).not.toContain('privateCanary')
    expect(() => assertPaymentRequestMode('sandbox', config)).toThrow('temporarily unavailable')
  })

  it.each([undefined, '', 'SANDBOX', 'test', ' live '])('rejects an unspecified/ambiguous mode %j', PAYMENT_MODE => {
    expect(getPaymentConfig({ ...sandbox, PAYMENT_MODE }).mode).toBe('unconfigured')
  })

  it.each([undefined, '', 'other', 'acct_bad/value'])('requires the intended account, not credential presence alone', STRIPE_EXPECTED_ACCOUNT_ID => {
    expect(getPaymentConfig({ ...sandbox, STRIPE_EXPECTED_ACCOUNT_ID }).issues).toContainEqual(expect.objectContaining({ code: 'ACCOUNT_UNCONFIGURED' }))
  })

  it.each([undefined, 'test', 'live', {}, ['sandbox']])('requires the frontend payment mode to agree (%j)', mode => {
    expect(() => assertPaymentRequestMode(mode, getPaymentConfig(sandbox))).toThrow('Reload checkout')
  })

  it('cannot enable live creation through environment flags while recovery is unfinished', () => {
    expect(LIVE_PAYMENTS_SUPPORTED).toBe(false)
    const config = getPaymentConfig({ ...sandbox, PAYMENT_MODE: 'live', STRIPE_SECRET_KEY: 'rk_live_syntheticOnly123' })
    expect(config.issues).toEqual([])
    expect(() => assertPaymentRequestMode('live', config)).toThrow('temporarily unavailable')
  })
})

describe('read-only Stripe environment verification', () => {
  it('verifies the actual account with a bounded read, never from a dashboard URL', async () => {
    const { service, createClient, retrieve } = fixture()
    const result = await service.getEnvironment()
    expect(result).toMatchObject({ mode: 'sandbox', keyMode: 'sandbox', verification: 'verified', accountId: sandbox.STRIPE_EXPECTED_ACCOUNT_ID, canCreatePayments: true, chargesEnabled: true, checkedAt: '2026-10-26T12:00:00.000Z' })
    expect(result.blockers).toEqual([])
    expect(createClient).toHaveBeenCalledOnce()
    expect(retrieve).toHaveBeenCalledExactlyOnceWith()
    expect(JSON.stringify(result)).not.toContain(sandbox.STRIPE_SECRET_KEY)
  })

  it('does not construct a client for incomplete/mismatched configuration', async () => {
    const { service, createClient } = fixture({ STRIPE_EXPECTED_ACCOUNT_ID: undefined })
    expect((await service.getEnvironment()).verification).toBe('unverified')
    await expect(service.getVerifiedContext()).rejects.toThrow('temporarily unavailable')
    expect(createClient).not.toHaveBeenCalled()
  })

  it('rejects a different account before creating or retrieving payments', async () => {
    const { service, retrieve, client } = fixture()
    retrieve.mockResolvedValue({ id: 'acct_otherFixture', charges_enabled: true })
    const result = await service.getEnvironment()
    expect(result).toMatchObject({ verification: 'failed', canCreatePayments: false, accountId: 'acct_otherFixture' })
    expect(result.blockers).toContainEqual(expect.objectContaining({ code: 'ACCOUNT_MISMATCH' }))
    await expect(service.getVerifiedContext({ forCreation: true })).rejects.toThrow('temporarily unavailable')
    expect(client.paymentIntents.create).not.toHaveBeenCalled()
    expect(client.paymentIntents.retrieve).not.toHaveBeenCalled()
  })

  it.each([false, undefined])('does not allow creation when charge capability is %s', charges_enabled => {
    const { service, retrieve } = fixture()
    retrieve.mockResolvedValue({ id: sandbox.STRIPE_EXPECTED_ACCOUNT_ID, charges_enabled })
    return expect(service.getVerifiedContext({ forCreation: true })).rejects.toThrow('temporarily unavailable')
  })

  it('reports live verification without pretending live charging is approved', async () => {
    const { service } = fixture({ PAYMENT_MODE: 'live', STRIPE_SECRET_KEY: 'rk_live_syntheticOnly123' })
    const result = await service.getEnvironment()
    expect(result).toMatchObject({ mode: 'live', verification: 'verified', canCreatePayments: false, livePaymentsSupported: false })
    expect(result.blockers).toContainEqual(expect.objectContaining({ code: 'LIVE_NOT_READY' }))
    await expect(service.getVerifiedContext({ forCreation: true })).rejects.toThrow('temporarily unavailable')
  })

  it.each(['sandbox', 'live'])('pausing %s prevents new creation but preserves existing payment verification', async mode => {
    const { service, client } = fixture({ PAYMENT_MODE: mode, PAYMENTS_ENABLED: 'false', STRIPE_SECRET_KEY: `rk_${mode === 'sandbox' ? 'test' : 'live'}_syntheticOnly123` })
    await expect(service.getVerifiedContext({ forCreation: true })).rejects.toThrow('temporarily unavailable')
    expect(await service.getVerifiedContext()).toEqual({ stripe: client, mode, accountId: sandbox.STRIPE_EXPECTED_ACCOUNT_ID })
  })

  it('coalesces concurrent reads, caches briefly and rechecks after expiry', async () => {
    const { service, retrieve, advance } = fixture()
    let release
    retrieve.mockReturnValueOnce(new Promise(resolve => { release = resolve }))
    const first = service.getEnvironment(), second = service.getEnvironment()
    release({ id: sandbox.STRIPE_EXPECTED_ACCOUNT_ID, charges_enabled: true })
    await Promise.all([first, second])
    await service.getEnvironment()
    expect(retrieve).toHaveBeenCalledOnce()
    advance(30001)
    await service.getEnvironment()
    expect(retrieve).toHaveBeenCalledTimes(2)
  })

  it('does not reuse verified identity when mode, account or credential changes', async () => {
    const { service, env, retrieve, createClient } = fixture()
    await service.getEnvironment()
    env.STRIPE_EXPECTED_ACCOUNT_ID = 'acct_changedFixture'
    retrieve.mockResolvedValue({ id: env.STRIPE_EXPECTED_ACCOUNT_ID, charges_enabled: true })
    expect((await service.getEnvironment()).accountId).toBe('acct_changedFixture')
    env.STRIPE_SECRET_KEY = 'rk_test_changedSynthetic123'
    await service.getEnvironment()
    expect(retrieve).toHaveBeenCalledTimes(3)
    expect(createClient).toHaveBeenCalledTimes(2)
  })

  it('redacts provider failures, fails closed, and permits a later deliberate recheck', async () => {
    const { service, retrieve, advance } = fixture()
    retrieve.mockRejectedValueOnce(new Error('PRIVATE_PROVIDER_CANARY'))
    const failed = await service.getEnvironment()
    expect(failed).toMatchObject({ verification: 'failed', accountId: null, canCreatePayments: false })
    expect(JSON.stringify(failed)).not.toContain('PRIVATE_PROVIDER_CANARY')
    await expect(service.getVerifiedContext()).rejects.toThrow('temporarily unavailable')
    expect(retrieve).toHaveBeenCalledOnce()
    advance(5001)
    expect((await service.getEnvironment()).verification).toBe('verified')
  })

  it('does not keep an earlier success after its cache expires and Stripe fails', async () => {
    const { service, retrieve, advance } = fixture()
    expect((await service.getEnvironment()).canCreatePayments).toBe(true)
    advance(30001)
    retrieve.mockRejectedValue(new Error('PRIVATE_EXPIRED_CANARY'))
    const result = await service.getEnvironment()
    expect(result).toMatchObject({ verification: 'failed', accountId: null, canCreatePayments: false })
    await expect(service.getVerifiedContext({ forCreation: true })).rejects.toThrow('temporarily unavailable')
    expect(JSON.stringify(result)).not.toContain('PRIVATE_EXPIRED_CANARY')
    expect(retrieve).toHaveBeenCalledTimes(2)
  })

  it('keeps overlapping checks bound to their own credential/account snapshots', async () => {
    const { service, env, retrieve } = fixture()
    let firstDone, secondDone
    retrieve.mockReturnValueOnce(new Promise(resolve => { firstDone = resolve }))
      .mockReturnValueOnce(new Promise(resolve => { secondDone = resolve }))
    const first = service.getEnvironment()
    env.STRIPE_SECRET_KEY = 'rk_test_secondFixture123'
    env.STRIPE_EXPECTED_ACCOUNT_ID = 'acct_secondFixture'
    const second = service.getEnvironment()
    secondDone({ id: 'acct_secondFixture', charges_enabled: true })
    expect(await second).toMatchObject({ accountId: 'acct_secondFixture', expectedAccountId: 'acct_secondFixture', verification: 'verified' })
    firstDone({ id: sandbox.STRIPE_EXPECTED_ACCOUNT_ID, charges_enabled: true })
    expect(await first).toMatchObject({ accountId: sandbox.STRIPE_EXPECTED_ACCOUNT_ID, expectedAccountId: sandbox.STRIPE_EXPECTED_ACCOUNT_ID, verification: 'verified' })
    retrieve.mockResolvedValue({ id: 'acct_secondFixture', charges_enabled: true })
    expect((await service.getEnvironment()).accountId).toBe('acct_secondFixture')
    expect(retrieve).toHaveBeenCalledTimes(3)
  })

  it('public configuration contains only the mode, Boolean availability and safe message', async () => {
    const { service } = fixture()
    const result = await service.getPublicConfiguration()
    expect(Object.keys(result).sort()).toEqual(['enabled', 'message', 'mode'])
    expect(result).toMatchObject({ enabled: true, mode: 'sandbox' })
    expect(JSON.stringify(result)).not.toContain('acct_')
    expect(JSON.stringify(result)).not.toContain('rk_')
  })

  it('paused public reads never construct a Stripe client', async () => {
    const { service, createClient } = fixture({ PAYMENTS_ENABLED: 'false' })
    expect(await service.getPublicConfiguration()).toMatchObject({ mode: 'sandbox', enabled: false })
    expect(createClient).not.toHaveBeenCalled()
  })
})
