import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
export async function fetchMediaLibrary({ search = '', folder = '', page = 1 } = {}) {
  const query = new URLSearchParams({ search, folder, page: String(page) })
  return parseJsonResponse(await fetchApi(`/api/admin/media?${query}`), 'Unable to load the image library.')
}
export async function uploadMediaImage(file, folder) {
  return parseJsonResponse(await fetchApi('/api/admin/media', {
    method: 'POST', body: file,
    headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name), 'X-Media-Folder': folder },
  }), 'Unable to upload this image.')
}
export async function saveMediaDetails(id, details) {
  return parseJsonResponse(await fetchApi(`/api/admin/media/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
  }), 'Unable to save the image details.')
}
