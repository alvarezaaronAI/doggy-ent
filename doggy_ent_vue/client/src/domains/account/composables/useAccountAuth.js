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

export function useAccountAuth() {
  const authenticated = computed(() => Boolean(user.value?.id))

  async function loadSession() {
    loading.value = true
    error.value = ''

    try {
      const data = await fetchCustomerSession()
      session.value = data?.session || null
      user.value = data?.user || data?.session?.user || null

      return user.value
    }
    catch {
      session.value = null
      user.value = null

      return null
    }
    finally {
      loading.value = false
    }
  }

  async function signIn(credentials) {
    loading.value = true
    error.value = ''

    try {
      await signInCustomer(credentials)
      return await loadSession()
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
    try {
      await signOutCustomer()
    }
    finally {
      session.value = null
      user.value = null
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
