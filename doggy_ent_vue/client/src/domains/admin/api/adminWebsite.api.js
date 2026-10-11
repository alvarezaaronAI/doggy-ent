import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
const endpoint = '/api/admin/storefront'
export async function fetchWebsiteDraft() {
  return parseJsonResponse(await fetchApi(endpoint), 'Unable to load website editor.')
}
export async function saveWebsiteDraft(content, revision, publish = false) {
  return parseJsonResponse(await fetchApi(`${endpoint}/${publish ? 'publish' : 'draft'}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, revision }),
  }), 'Unable to save website changes.')
}
