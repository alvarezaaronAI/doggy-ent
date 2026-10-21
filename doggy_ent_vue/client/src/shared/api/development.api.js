import { fetchApi, parseJsonResponse } from './http.js'

export async function fetchDevelopmentContext() {
  return parseJsonResponse(await fetchApi('/api/health', { cache: 'no-store' }), 'Unable to verify the development backend.')
}
