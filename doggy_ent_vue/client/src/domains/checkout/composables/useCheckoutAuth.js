import { computed, reactive, ref } from 'vue'
import { useAccountAuth } from '@domains/account/composables/useAccountAuth.js'
import { normalizeAccountEmail, validateCreateAccountForm, validateSignInForm } from '@domains/account/validators/account.validators.js'
export function useCheckoutAuth(mode, customer, authenticated) {
  const auth = useAccountAuth()
  const activeMode = ref(mode), review = ref(false), message = ref('')
  let accountCreated = false
  const form = reactive({ firstName: customer.firstName || '', lastName: customer.lastName || '', email: customer.email || '', password: '', confirmPassword: '' })
  const creating = computed(() => activeMode.value === 'create')
  function switchMode(value) { activeMode.value = value; review.value = false; message.value = ''; form.password = ''; form.confirmPassword = '' }
  function validation() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeAccountEmail(form.email))) return 'Enter a valid email address.'
    if (!creating.value) return validateSignInForm(form)
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Enter your first and last name.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return validateCreateAccountForm({ ...form, name: form.firstName.trim() + ' ' + form.lastName.trim() })
  }
  async function submit() {
    if (auth.loading.value) return
    message.value = validation()
    if (message.value) return
    if (creating.value && !review.value) { review.value = true; return }
    const credentials = { email: normalizeAccountEmail(form.email), password: form.password }
    try {
      let user
      if (creating.value && !accountCreated) {
        user = await auth.signUp({ ...credentials, name: form.firstName.trim() + ' ' + form.lastName.trim() })
        accountCreated = true
      } else user = await auth.signIn(credentials)
      if (!user && creating.value) user = await auth.signIn(credentials)
      if (!user) throw new Error('Your session could not be confirmed. Sign in again; your bag and checkout details are unchanged.')
      form.password = ''; form.confirmPassword = ''
      authenticated({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: credentials.email })
    } catch (error) { message.value = error.message || 'Unable to sign in.' }
  }
  return { form, creating, review, message, loading: auth.loading, switchMode, submit }
}
