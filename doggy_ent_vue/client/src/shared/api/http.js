function normalizeApiBaseUrl(value) {
  const url = String(value || '').trim()

  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace(/\/$/, '')
  }

  return `https://${url}`.replace(/\/$/, '')
}

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL,
)

const ADMIN_DATA_TARGET = String(
  import.meta.env.VITE_ADMIN_DATA_TARGET || '',
)
  .trim()
  .toUpperCase()

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function getAdminDataTarget() {
  if (
    ADMIN_DATA_TARGET === 'RAILWAY'
    || ADMIN_DATA_TARGET === 'RAILWAY_DB'
  ) {
    return 'RAILWAY_DB'
  }

  if (ADMIN_DATA_TARGET === 'LOCAL') {
    return 'LOCAL'
  }

  return 'LOCAL'
}

export function buildApiUrl(path) {
  if (getAdminDataTarget() === 'RAILWAY_DB' && !API_BASE_URL) {
    throw new Error(
      'RAILWAY DB TARGET requires VITE_API_BASE_URL or VITE_API_URL to point to the local backend origin.',
    )
  }

  const normalizedPath = String(path || '').startsWith('/')
    ? String(path || '')
    : `/${path || ''}`

  return `${API_BASE_URL}${normalizedPath}`
}

export async function parseJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || ''
  const expectsJson = contentType.includes('application/json')

  let data = null

  if (expectsJson) {
    try {
      data = await response.json()
    }
    catch {
      data = null
    }
  }

  if (!response.ok) {
    if (!expectsJson) {
      throw new Error(
        `${fallbackMessage} API returned ${response.status} ${response.statusText || 'error'} instead of JSON. Check VITE_API_BASE_URL and deployment routing.`,
      )
    }

    throw new Error(data?.message || fallbackMessage)
  }

  if (!expectsJson) {
    throw new Error(
      `${fallbackMessage} API returned a non-JSON response. Check VITE_API_BASE_URL and deployment routing.`,
    )
  }

  return data
}

export function fetchApi(path, options = {}) {
  return fetch(buildApiUrl(path), {
    credentials: 'include',
    ...options,
  })
}
