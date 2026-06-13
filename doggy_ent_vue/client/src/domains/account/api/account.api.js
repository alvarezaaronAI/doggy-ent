import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const ACCOUNT_API_URL = '/api/account'

export async function fetchAccountDashboard() {
  const data = await parseJsonResponse(
    await fetchApi(ACCOUNT_API_URL),
    'Unable to load account dashboard.',
  )

  return data.result
}

export async function fetchAccountProfile() {
  const data = await parseJsonResponse(
    await fetchApi(`${ACCOUNT_API_URL}/profile`),
    'Unable to load account profile.',
  )

  return data.result
}

export async function updateAccountProfile(profile) {
  const data = await parseJsonResponse(
    await fetchApi(`${ACCOUNT_API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    }),
    'Unable to update account profile.',
  )

  return data.result
}

export async function fetchAccountOrders() {
  const data = await parseJsonResponse(
    await fetchApi(`${ACCOUNT_API_URL}/orders`),
    'Unable to load account orders.',
  )

  return data.result
}

export async function fetchAccountOrder(reference) {
  const data = await parseJsonResponse(
    await fetchApi(`${ACCOUNT_API_URL}/orders/${encodeURIComponent(reference)}`),
    'Unable to load account order.',
  )

  return data.result
}
