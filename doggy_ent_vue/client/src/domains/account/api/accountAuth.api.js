import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'
import {
  customerAuthClient,
} from './authClient.js'

const AUTH_API_URL = '/api/customer-auth'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function useBetterAuthSession() {
  return customerAuthClient.useSession()
}

export async function fetchCustomerSession() {
  return parseJsonResponse(
    await fetchApi(`${AUTH_API_URL}/get-session`),
    'Unable to load account session.',
  )
}

export async function signInCustomer({
  email,
  password,
}) {
  return parseJsonResponse(
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
  return parseJsonResponse(
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
  return parseJsonResponse(
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
  return parseJsonResponse(
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
  return parseJsonResponse(
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
  return parseJsonResponse(
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
