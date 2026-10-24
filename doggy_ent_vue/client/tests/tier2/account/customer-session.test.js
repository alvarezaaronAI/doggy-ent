import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({ fetchCustomerSession: vi.fn(), signInCustomer: vi.fn(), signOutCustomer: vi.fn(), signUpCustomer: vi.fn(), requestCustomerPasswordReset: vi.fn(), sendCustomerVerificationEmail: vi.fn() }))
vi.mock('../../../src/domains/account/api/accountAuth.api.js', () => api)
let useAccountAuth
beforeEach(async () => {
  vi.resetModules()
  vi.resetAllMocks()
  ;({ useAccountAuth } = await import('../../../src/domains/account/composables/useAccountAuth.js'))
})

describe('customer session confirmation', () => {
  it('confirms the cookie-backed session instead of trusting the login response', async () => {
    api.signInCustomer.mockResolvedValue({ user: { id: 'not-session-proof' } })
    api.fetchCustomerSession.mockResolvedValue({ session: { id: 'fixture-session' }, user: { id: 'fixture-user' } })
    const auth = useAccountAuth()
    expect(await auth.signIn({ email: 'fixture@example.test', password: 'fixture-only' })).toEqual({ id: 'fixture-user' })
    expect(auth.authenticated.value).toBe(true)
  })
  it('reports accepted login with missing or failed session without false authentication', async () => {
    const auth = useAccountAuth()
    api.fetchCustomerSession.mockResolvedValueOnce(null).mockResolvedValueOnce({ user: { id: 'not-proof' }, session: null }).mockRejectedValueOnce(new Error('fixture connection failure'))
    for (let attempt = 0; attempt < 3; attempt++) {
      await expect(auth.signIn({})).rejects.toThrow('browser session could not be confirmed')
      expect(auth.authenticated.value).toBe(false)
      expect(auth.loading.value).toBe(false)
    }
  })
  it('does not let an older anonymous read overwrite a confirmed new sign-in', async () => {
    let completeOldRead
    api.fetchCustomerSession.mockImplementationOnce(() => new Promise(resolve => { completeOldRead = resolve }))
    const auth = useAccountAuth(), oldRead = auth.loadSession()
    api.fetchCustomerSession.mockResolvedValueOnce({ user: { id: 'current-user' }, session: { id: 'current-session' } })
    await auth.signIn({})
    completeOldRead(null)
    await oldRead
    expect(auth.user.value.id).toBe('current-user')
    expect(auth.authenticated.value).toBe(true)
  })
  it('invalidates outstanding reads on sign-out', async () => {
    let completeOldRead
    api.fetchCustomerSession.mockImplementationOnce(() => new Promise(resolve => { completeOldRead = resolve }))
    const auth = useAccountAuth(), oldRead = auth.loadSession()
    await auth.signOut()
    completeOldRead({ user: { id: 'signed-out-user' }, session: {} })
    await oldRead
    expect(auth.user.value).toBeNull()
    expect(auth.loading.value).toBe(false)
  })
  it('keeps null signup sessions available to the checkout retry workflow without duplicate signup', async () => {
    api.fetchCustomerSession.mockResolvedValue(null)
    expect(await useAccountAuth().signUp({})).toBeNull()
    expect(api.signUpCustomer).toHaveBeenCalledTimes(1)
  })
  it('clears revoked identity after reset and prevents an older session read restoring it', async () => {
    const auth = useAccountAuth()
    api.fetchCustomerSession.mockResolvedValueOnce({ user: { id: 'prior-user' }, session: { id: 'prior-session' } })
    await auth.loadSession()
    let completeOldRead
    api.fetchCustomerSession.mockImplementationOnce(() => new Promise(resolve => { completeOldRead = resolve }))
    const oldRead = auth.loadSession()
    auth.clearSession()
    completeOldRead({ user: { id: 'prior-user' }, session: { id: 'prior-session' } })
    await oldRead
    expect(auth.user.value).toBeNull(); expect(auth.session.value).toBeNull(); expect(auth.authenticated.value).toBe(false)
  })
})
