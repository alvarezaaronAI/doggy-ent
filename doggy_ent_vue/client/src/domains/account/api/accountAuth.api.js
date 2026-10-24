import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'
import {
  customerAuthClient,
} from './authClient.js'

const AUTH_API_URL = '/api/customer-auth'

async function parseAuthResponse(response, fallback) {
  try { return await parseJsonResponse(response, fallback) }
  catch (error) { error.status = response.status; throw error }
}

export async function fetchCustomerAuthReadiness() {
  return parseAuthResponse(await fetchApi(`${AUTH_API_URL}/readiness`), 'Unable to check account recovery.')
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function useBetterAuthSession() {
  return customerAuthClient.useSession()
}

export async function fetchCustomerSession() {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/get-session`),
    'Unable to load account session.',
  )
}

export async function signInCustomer({
  email,
  password,
}) {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizeEmail(email),
        password,
      }),
    }),
    'Unable to sign in.',
  )
}

export async function signUpCustomer({
  name,
  email,
  password,
}) {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: String(name || '').trim(),
        email: normalizeEmail(email),
        password,
      }),
    }),
    'Unable to create account.',
  )
}

export async function signOutCustomer() {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/sign-out`, {
      method: 'POST',
    }),
    'Unable to sign out.',
  )
}

export async function requestCustomerPasswordReset({
  email,
  redirectTo,
}) {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizeEmail(email),
        redirectTo,
      }),
    }),
    'Unable to request password reset.',
  )
}

export async function resetCustomerPassword({
  token,
  password,
}) {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword: password,
      }),
    }),
    'Unable to reset password.',
  )
}

export async function sendCustomerVerificationEmail({
  email,
}) {
  return parseAuthResponse(
    await fetchApi(`${AUTH_API_URL}/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizeEmail(email),
      }),
    }),
    'Unable to queue verification email.',
  )
}
