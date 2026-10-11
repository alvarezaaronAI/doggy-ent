import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
export async function fetchStorefrontContent() {
  return parseJsonResponse(await fetchApi('/api/storefront/content'), 'Website content is temporarily unavailable.')
}
