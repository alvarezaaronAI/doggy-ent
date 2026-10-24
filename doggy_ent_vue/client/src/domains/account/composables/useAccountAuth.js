import { computed, ref } from 'vue'
import {
  fetchCustomerSession,
  requestCustomerPasswordReset,
  sendCustomerVerificationEmail,
  signInCustomer,
  signOutCustomer,
  signUpCustomer,
} from '../api/accountAuth.api.js'

const session = ref(null)
const user = ref(null)
const loading = ref(false)
const error = ref('')
let sessionGeneration = 0

export function useAccountAuth() {
  const authenticated = computed(() => Boolean(user.value?.id))

  function clearSession() {
    sessionGeneration++
    session.value = null
    user.value = null
    loading.value = false
    error.value = ''
  }

  async function loadSession() {
    const generation = ++sessionGeneration
    loading.value = true
    error.value = ''

    try {
      const data = await fetchCustomerSession()
      if (generation !== sessionGeneration) return user.value
      const confirmedUser = data?.session && (data.user || data.session.user)
      user.value = confirmedUser?.id ? confirmedUser : null
      session.value = user.value ? data.session : null

      return user.value
    }
    catch {
      if (generation !== sessionGeneration) return user.value
      session.value = null
      user.value = null

      return null
    }
    finally {
      if (generation === sessionGeneration) loading.value = false
    }
  }

  async function signIn(credentials) {
    sessionGeneration++
    loading.value = true
    error.value = ''

    try {
      await signInCustomer(credentials)
      const signedInUser = await loadSession()
      if (!signedInUser) throw new Error('Your sign-in was accepted, but your browser session could not be confirmed. Check that this site uses the intended backend and allows its sign-in cookies. Your bag is unchanged.')
      return signedInUser
    }
    catch (signInError) {
      error.value = signInError.message || 'Unable to sign in.'
      throw signInError
    }
    finally {
      loading.value = false
    }
  }

  async function signUp(credentials) {
    sessionGeneration++
    loading.value = true
    error.value = ''

    try {
      await signUpCustomer(credentials)
      return await loadSession()
    }
    catch (signUpError) {
      error.value = signUpError.message || 'Unable to create account.'
      throw signUpError
    }
    finally {
      loading.value = false
    }
  }

  async function signOut() {
    sessionGeneration++
    try {
      await signOutCustomer()
    }
    finally {
      session.value = null
      user.value = null
      loading.value = false
    }
  }

  async function requestPasswordReset(payload) {
    return requestCustomerPasswordReset(payload)
  }

  async function resendVerification(payload) {
    return sendCustomerVerificationEmail(payload)
  }

  return {
    authenticated,
    clearSession,
    error,
    loading,
    loadSession,
    requestPasswordReset,
    resendVerification,
    session,
    signIn,
    signOut,
    signUp,
    user,
  }
}
