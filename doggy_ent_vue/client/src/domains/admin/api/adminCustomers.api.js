import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const ADMIN_CUSTOMERS_API_URL = '/api/admin/customers'

async function parseCustomerResponse(response, fallbackMessage) {
  const data = await parseJsonResponse(response, fallbackMessage)

  return data.result
}

export async function fetchAdminCustomers() {
  return parseCustomerResponse(
    await fetchApi(ADMIN_CUSTOMERS_API_URL),
    'Unable to load customers.',
  )
}

export async function fetchAdminCustomerById(customerId) {
  return parseCustomerResponse(
    await fetchApi(`${ADMIN_CUSTOMERS_API_URL}/${customerId}`),
    'Unable to load customer.',
  )
}

export async function deactivateAdminCustomer(customerId) {
  return parseCustomerResponse(
    await fetchApi(`${ADMIN_CUSTOMERS_API_URL}/${customerId}/deactivate`, {
      method: 'POST',
    }),
    'Unable to deactivate customer.',
  )
}

export async function reactivateAdminCustomer(customerId) {
  return parseCustomerResponse(
    await fetchApi(`${ADMIN_CUSTOMERS_API_URL}/${customerId}/reactivate`, {
      method: 'POST',
    }),
    'Unable to reactivate customer.',
  )
}

export async function queueAdminCustomerVerification(customerId) {
  return parseCustomerResponse(
    await fetchApi(`${ADMIN_CUSTOMERS_API_URL}/${customerId}/resend-verification`, {
      method: 'POST',
    }),
    'Unable to queue verification email.',
  )
}

export async function queueAdminCustomerPasswordReset(customerId) {
  return parseCustomerResponse(
    await fetchApi(`${ADMIN_CUSTOMERS_API_URL}/${customerId}/password-reset`, {
      method: 'POST',
    }),
    'Unable to queue password reset.',
  )
}
