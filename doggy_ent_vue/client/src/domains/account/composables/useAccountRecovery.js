import { computed, onScopeDispose, reactive, ref, watch } from 'vue'
import { fetchCustomerAuthReadiness, requestCustomerPasswordReset, resetCustomerPassword } from '../api/accountAuth.api.js'
import { normalizeAccountEmail, validateAccountEmail, validateNewAccountPassword, validatePasswordConfirmation } from '../validators/account.validators.js'
import { safeAccountReturn } from '../utils/accountNavigation.js'
import { useAccountAuth } from './useAccountAuth.js'
import { useAccountFieldValidation } from './useAccountFieldValidation.js'

export function useAccountRecovery({ token, invalidLink = false, redirect = '', origin = '' } = {}) {
  const { clearSession } = useAccountAuth()
  let proof = typeof token === 'string' && token.length <= 512 ? token : ''
  const email = ref(''), form = reactive({ password: '', confirmPassword: '' })
  const busy = ref(false), serverMessage = ref(''), complete = ref(false), checking = ref(false), resetAvailable = ref(null)
  const emailValidation = useAccountFieldValidation(() => ({ email: validateAccountEmail(email.value) }))
  const passwordValidation = useAccountFieldValidation(() => ({ password: validateNewAccountPassword(form.password), confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword) }))
  const message = computed(() => serverMessage.value || emailValidation.firstError.value || passwordValidation.firstError.value)
  const validLink = computed(() => Boolean(proof) && !invalidLink)
  const target = safeAccountReturn(redirect)
  watch(() => [email.value, form.password, form.confirmPassword], () => { serverMessage.value = '' }, { flush: 'sync' })
  async function loadReadiness() {
    checking.value = true
    try { resetAvailable.value = (await fetchCustomerAuthReadiness()).passwordResetAvailable === true }
    catch { resetAvailable.value = null; serverMessage.value = 'We could not check email recovery. Please try again.' }
    finally { checking.value = false }
  }
  async function requestReset() {
    if (busy.value || complete.value || resetAvailable.value !== true) return
    serverMessage.value = ''
    if (!emailValidation.check()) return
    busy.value = true
    try {
      const returnUrl = new URL('/account/reset-password', origin)
      if (target) returnUrl.searchParams.set('redirect', target)
      await requestCustomerPasswordReset({ email: normalizeAccountEmail(email.value), redirectTo: returnUrl.href })
      complete.value = true
      serverMessage.value = ''
    } catch (error) {
      serverMessage.value = error?.status === 429 ? 'Too many requests. Please wait a few minutes before trying again.' : 'We could not request a reset link right now. Please try again later or contact us.'
    } finally { busy.value = false }
  }
  async function resetPassword() {
    if (busy.value || complete.value || !validLink.value) return
    serverMessage.value = ''
    if (!passwordValidation.check()) return
    busy.value = true
    try {
      await resetCustomerPassword({ token: proof, password: form.password })
      clearSession()
      passwordValidation.clear()
      proof = ''; form.password = ''; form.confirmPassword = ''; complete.value = true
    } catch {
      serverMessage.value = 'This link may have expired or already been used. Request a new reset link to continue.'
    } finally { busy.value = false }
  }
  onScopeDispose(() => { proof = ''; form.password = ''; form.confirmPassword = '' })
  return { email, form, busy, message, complete, checking, resetAvailable, validLink, emailErrors: emailValidation.errors, passwordErrors: passwordValidation.errors, emailStates: emailValidation.states, passwordStates: passwordValidation.states, touchEmail: emailValidation.touch, touchPassword: passwordValidation.touch, loadReadiness, requestReset, resetPassword }
}
