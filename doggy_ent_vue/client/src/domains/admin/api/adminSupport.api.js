import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value)
    }
  }

  const query = searchParams.toString()

  return query ? `?${query}` : ''
}

export async function fetchAdminOrderIssues(filters = {}) {
  const data = await parseJsonResponse(
    await fetchApi(`/api/admin/order-issues${buildQuery(filters)}`),
    'Unable to load order issues.',
  )

  return data.result
}

export async function updateAdminOrderIssue(caseNumber, payload) {
  const data = await parseJsonResponse(
    await fetchApi(`/api/admin/order-issues/${encodeURIComponent(caseNumber)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    'Unable to update order issue.',
  )

  return data.result
}

export async function addAdminOrderIssueMessage(caseNumber, payload) {
  const data = await parseJsonResponse(
    await fetchApi(`/api/admin/order-issues/${encodeURIComponent(caseNumber)}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    'Unable to add order issue message.',
  )

  return data.result
}

export async function fetchAdminInternalIssues(filters = {}) {
  const data = await parseJsonResponse(
    await fetchApi(`/api/admin/internal-issues${buildQuery(filters)}`),
    'Unable to load internal issues.',
  )

  return data.result
}

export async function updateAdminInternalIssue(caseNumber, payload) {
  const data = await parseJsonResponse(
    await fetchApi(`/api/admin/internal-issues/${encodeURIComponent(caseNumber)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    'Unable to update internal issue.',
  )

  return data.result
}
