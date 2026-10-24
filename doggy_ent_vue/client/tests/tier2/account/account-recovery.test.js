import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
const api = vi.hoisted(() => ({ fetchCustomerAuthReadiness: vi.fn(), requestCustomerPasswordReset: vi.fn(), resetCustomerPassword: vi.fn() }))
const auth = vi.hoisted(() => ({ clearSession: vi.fn() }))
vi.mock('../../../src/domains/account/api/accountAuth.api.js', () => api)
vi.mock('../../../src/domains/account/composables/useAccountAuth.js', () => ({ useAccountAuth: () => auth }))
import { useAccountRecovery } from '../../../src/domains/account/composables/useAccountRecovery.js'
function setup(options = {}) { const scope = effectScope(); return { scope, state: scope.run(() => useAccountRecovery({ origin: 'https://shop.example.test', ...options })) } }
beforeEach(() => vi.resetAllMocks())
describe('honest link-driven recovery', () => {
  it('does not request mail while provider is unavailable or unknown', async () => {
    const { state, scope } = setup()
    state.email.value = 'fixture@example.test'
    await state.requestReset(); expect(api.requestCustomerPasswordReset).not.toHaveBeenCalled()
    api.fetchCustomerAuthReadiness.mockResolvedValue({ passwordResetAvailable: false })
    await state.loadReadiness(); await state.requestReset()
    expect(state.resetAvailable.value).toBe(false); expect(state.complete.value).toBe(false)
    expect(api.requestCustomerPasswordReset).not.toHaveBeenCalled(); scope.stop()
  })
  it('validates email, preserves checkout return and requests only once', async () => {
    const { state, scope } = setup({ redirect: '/checkout' })
    api.fetchCustomerAuthReadiness.mockResolvedValue({ passwordResetAvailable: true })
    await state.loadReadiness(); state.email.value = 'bad'; await state.requestReset()
    expect(state.message.value).toContain('valid email')
    expect(state.emailErrors.value.email).toContain('valid email')
    state.email.value = ' Fixture@Example.test '
    await state.requestReset(); await state.requestReset()
    expect(api.requestCustomerPasswordReset).toHaveBeenCalledOnce()
    expect(api.requestCustomerPasswordReset).toHaveBeenCalledWith({ email: 'fixture@example.test', redirectTo: 'https://shop.example.test/account/reset-password?redirect=%2Fcheckout' })
    expect(state.complete.value).toBe(true); scope.stop()
  })
  it('never marks failed or rate-limited requests as delivered', async () => {
    const { state, scope } = setup()
    state.resetAvailable.value = true; state.email.value = 'fixture@example.test'
    api.requestCustomerPasswordReset.mockRejectedValue({ status: 429 })
    await state.requestReset(); expect(state.complete.value).toBe(false); expect(state.message.value).toContain('wait')
    scope.stop()
  })
  it.each([undefined, [], 'x'.repeat(513)])('rejects missing/malformed reset proofs without a request', async token => {
    const { state, scope } = setup({ token })
    await state.resetPassword(); expect(state.validLink.value).toBe(false); expect(api.resetCustomerPassword).not.toHaveBeenCalled(); scope.stop()
  })
  it('requires matching passwords and clears the private proof/password after successful use', async () => {
    const { state, scope } = setup({ token: 'synthetic-reset-proof' })
    state.form.password = 'fixture-password-123'; state.form.confirmPassword = 'different'
    await state.resetPassword(); expect(api.resetCustomerPassword).not.toHaveBeenCalled()
    expect(state.passwordErrors.value.confirmPassword).toContain('do not match')
    state.form.confirmPassword = state.form.password
    await state.resetPassword(); await state.resetPassword()
    expect(api.resetCustomerPassword).toHaveBeenCalledOnce()
    expect(auth.clearSession).toHaveBeenCalledOnce()
    expect(state).not.toHaveProperty('token'); expect(state.form.password).toBe(''); expect(state.complete.value).toBe(true)
    scope.stop()
  })
  it('handles used/expired links without exposing provider details', async () => {
    const { state, scope } = setup({ token: 'synthetic-reset-proof' })
    state.form.password = state.form.confirmPassword = 'fixture-password-123'
    api.resetCustomerPassword.mockRejectedValue(new Error('private provider detail'))
    await state.resetPassword(); expect(state.complete.value).toBe(false); expect(state.message.value).toContain('expired'); expect(state.message.value).not.toContain('provider')
    expect(auth.clearSession).not.toHaveBeenCalled()
    scope.stop()
  })
})
