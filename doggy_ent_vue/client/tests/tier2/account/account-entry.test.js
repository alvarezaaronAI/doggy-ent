import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
const auth = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }))
vi.mock('../../../src/domains/account/composables/useAccountAuth.js', () => ({ useAccountAuth: () => auth }))
import { useAccountEntry, accountEntryError } from '../../../src/domains/account/composables/useAccountEntry.js'
import { accountRedirectQuery, safeAccountReturn } from '../../../src/domains/account/utils/accountNavigation.js'
import { validateAccountEntryFields, validateCreateAccountForm, validateSignInForm } from '../../../src/domains/account/validators/account.validators.js'
function setup(options = {}) {
  const scope = effectScope(), onSuccess = vi.fn()
  const state = scope.run(() => useAccountEntry({ onSuccess, ...options }))
  Object.assign(state.form, { name: 'Fixture Person', email: ' Fixture@Example.test ', password: 'fixture-password-123', confirmPassword: 'fixture-password-123' })
  return { state, scope, onSuccess }
}
beforeEach(() => vi.resetAllMocks())
describe('safe account destinations', () => {
  it.each(['https://outside.test', '//outside.test', '/\\outside.test', '/admin', '/api/private', '/account/sign-in', '/account/reset-password', ['//outside.test'], '/x\n/evil'])('rejects unsafe/auth-loop return %s', value => expect(safeAccountReturn(value)).toBe(''))
  it('preserves checkout and safe local query/anchors without inventing an external destination', () => {
    expect(safeAccountReturn('/checkout')).toBe('/checkout')
    expect(accountRedirectQuery('/account/orders?status=PAID#recent')).toEqual({ redirect: '/account/orders?status=PAID#recent' })
    expect(accountRedirectQuery('//outside.test')).toEqual({})
  })
})
describe('reviewed, session-confirmed account entry', () => {
  it('shows field errors only after blur or submit, then clears them as details are corrected', async () => {
    const { state, scope } = setup({ creating: true })
    Object.assign(state.form, { name: '', email: '', password: '', confirmPassword: '' })
    expect(state.errors.value).toEqual({})
    expect(state.fieldStates.value).toEqual({})
    state.touch('email'); expect(Object.keys(state.errors.value)).toEqual(['email'])
    expect(state.fieldStates.value.email).toBe('invalid')
    expect(state.message.value).toBe('')
    await state.submit()
    expect(Object.keys(state.errors.value)).toEqual(['name', 'email', 'password', 'confirmPassword'])
    expect(auth.signUp).not.toHaveBeenCalled()
    Object.assign(state.form, { name: 'Renée O’Connor', email: 'person@example.test', password: 'a unique passphrase', confirmPassword: 'a unique passphrase' })
    expect(state.errors.value).toEqual({}); expect(state.message.value).toBe('')
    expect(Object.values(state.fieldStates.value)).toEqual(['valid', 'valid', 'valid', 'valid'])
    await state.submit(); expect(state.review.value).toBe(true); scope.stop()
  })
  it('does not assume which credential is wrong, and removes server-error styling when edited', async () => {
    const { state, scope } = setup()
    auth.signIn.mockRejectedValue({ status: 401 })
    await state.submit()
    expect(state.credentialsRejected.value).toBe(true)
    expect(state.errors.value).toEqual({})
    expect(state.message.value).toContain('email or password')
    state.form.password = 'another fixture password'; await nextTick()
    expect(state.credentialsRejected.value).toBe(false); expect(state.message.value).toBe('')
    scope.stop()
  })
  it('accepts single/full Unicode names without inventing required name parts', () => {
    for (const name of ['Alex', '李 明', 'Renée O’Connor', 'María del Carmen García']) {
      expect(validateAccountEntryFields({ name, email: 'person@example.test', password: 'a unique passphrase', confirmPassword: 'a unique passphrase' }, true)).toEqual({ name: '', email: '', password: '', confirmPassword: '' })
    }
    expect(validateAccountEntryFields({ name: 'a'.repeat(101) }, true).name).toContain('100')
  })
  it('reviews name/email before a signup and only sends the identity allowlist', async () => {
    const { state, onSuccess, scope } = setup({ creating: true, redirect: '/checkout' })
    await state.submit()
    expect(state.review.value).toBe(true); expect(auth.signUp).not.toHaveBeenCalled()
    auth.signUp.mockResolvedValue({ id: 'customer-fixture' })
    await state.submit()
    expect(auth.signUp).toHaveBeenCalledWith({ name: 'Fixture Person', email: 'fixture@example.test', password: 'fixture-password-123' })
    expect(onSuccess).toHaveBeenCalledWith('/checkout')
    expect(state.form.password).toBe(''); expect(state.message.value).toBe(''); expect(state.errors.value).toEqual({}); expect(state.fieldStates.value).toEqual({}); scope.stop()
  })
  it('validates confirmation and allows correcting review details before any write', async () => {
    const { state, scope } = setup({ creating: true })
    state.form.confirmPassword = 'different'
    await state.submit(); expect(state.message.value).toContain('do not match')
    state.form.confirmPassword = state.form.password
    await state.submit(); state.edit(); expect(state.review.value).toBe(false)
    expect(auth.signUp).not.toHaveBeenCalled(); scope.stop()
  })
  it('prevents duplicate signup after a created account has no retained session', async () => {
    const { state, onSuccess, scope } = setup({ creating: true })
    auth.signUp.mockResolvedValue(null)
    await state.submit(); await state.submit(); await state.submit()
    expect(auth.signUp).toHaveBeenCalledTimes(1)
    expect(state.accountCreated.value).toBe(true)
    expect(state.message.value).toContain('please do not create the account again')
    expect(onSuccess).not.toHaveBeenCalled(); scope.stop()
  })
  it('normalizes sign-in, blocks duplicate requests and does not redirect a departed page', async () => {
    const { state, scope, onSuccess } = setup({ redirect: '/checkout' })
    let finish
    auth.signIn.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const pending = state.submit(); await state.submit()
    expect(auth.signIn).toHaveBeenCalledTimes(1)
    expect(auth.signIn.mock.calls[0][0].email).toBe('fixture@example.test')
    scope.stop(); finish({ id: 'customer-fixture' }); await pending
    expect(onSuccess).not.toHaveBeenCalled(); expect(state.form.password).toBe('')
  })
  it('uses customer-safe failure messages without server internals', async () => {
    const { state, scope } = setup()
    auth.signIn.mockRejectedValue(Object.assign(new Error('private database error'), { status: 401 }))
    await state.submit(); expect(state.message.value).toContain('email or password')
    expect(state.message.value).not.toContain('database')
    expect(accountEntryError({ status: 429 })).toContain('Too many attempts')
    expect(validateSignInForm({ email: 'not-email', password: 'fixture' })).toContain('valid email')
    expect(validateCreateAccountForm({ name: 'Person', email: 'fixture@example.test', password: 'a'.repeat(129) })).toContain('128')
    scope.stop()
  })
})
