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

export function buildApiUrl(path) {
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
