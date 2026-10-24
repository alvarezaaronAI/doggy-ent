import { computed, onScopeDispose, reactive, ref, watch } from 'vue'
import { useAccountAuth } from './useAccountAuth.js'
import { normalizeAccountEmail, validateAccountEntryFields } from '../validators/account.validators.js'
import { safeAccountReturn } from '../utils/accountNavigation.js'
import { useAccountFieldValidation } from './useAccountFieldValidation.js'

export function accountEntryError(error, creating = false) {
  if (error?.status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (/browser session could not be confirmed/.test(error?.message || '')) return 'We could not keep you signed in. Please check your browser cookie settings and try again. Your bag is unchanged.'
  if (error?.status === 401 && !creating) return 'The email or password is not right. Try again or reset your password.'
  return creating ? 'We could not create your account. Check your details, or sign in if you already have an account.' : 'We could not sign you in. Check your details and connection, then try again.'
}

export function useAccountEntry({ creating = false, redirect, onSuccess }) {
  const auth = useAccountAuth()
  const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
  const review = ref(false), serverMessage = ref(''), busy = ref(false), accountCreated = ref(false), credentialsRejected = ref(false)
  const validation = useAccountFieldValidation(() => validateAccountEntryFields(form, creating))
  const message = computed(() => serverMessage.value || validation.firstError.value)
  const loading = computed(() => busy.value)
  const target = safeAccountReturn(redirect) || '/account'
  let active = true
  watch(() => [form.name, form.email, form.password, form.confirmPassword], () => { credentialsRejected.value = false; serverMessage.value = '' }, { flush: 'sync' })
  async function submit() {
    if (busy.value || accountCreated.value) return
    serverMessage.value = ''; credentialsRejected.value = false
    if (!validation.check()) return
    form.email = normalizeAccountEmail(form.email)
    if (creating && !review.value) { review.value = true; return }
    busy.value = true
    try {
      let user
      if (creating) {
        user = await auth.signUp({ name: form.name.trim(), email: form.email, password: form.password })
        accountCreated.value = true
      } else user = await auth.signIn({ email: form.email, password: form.password })
      if (!user) {
        serverMessage.value = creating ? 'Your account was created, but we could not keep you signed in. Sign in to continue; please do not create the account again. Your bag is unchanged.' : 'We could not confirm your sign-in. Please check your browser cookie settings and try again. Your bag is unchanged.'
        return
      }
      validation.clear()
      form.password = ''; form.confirmPassword = ''
      if (active) await onSuccess(target)
    } catch (error) {
      if (active) {
        credentialsRejected.value = !creating && error?.status === 401
        serverMessage.value = accountCreated.value ? 'Your account is created. Sign in to continue; your bag is unchanged.' : accountEntryError(error, creating)
      }
    }
    finally { busy.value = false }
  }
  function edit() { if (!busy.value) { review.value = false; serverMessage.value = '' } }
  onScopeDispose(() => { active = false; form.password = ''; form.confirmPassword = '' })
  return { form, review, message, loading, accountCreated, credentialsRejected, errors: validation.errors, fieldStates: validation.states, touch: validation.touch, submit, edit, target }
}
