import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
import { APPLICATION_SURFACE } from '@shared/config/applicationSurface.js'
import { prepareGatewayImage } from '../utils/prepareGatewayImage.js'
export async function fetchMediaLibrary({ search = '', folder = '', page = 1 } = {}) {
  const query = new URLSearchParams({ search, folder, page: String(page) })
  return parseJsonResponse(await fetchApi(`/api/admin/media?${query}`), 'Unable to load the image library.')
}
export async function uploadMediaImage(file, folder) {
  const body = APPLICATION_SURFACE === 'admin' ? await prepareGatewayImage(file) : file
  return parseJsonResponse(await fetchApi('/api/admin/media', {
    method: 'POST', body,
    headers: { 'Content-Type': body.type, 'X-File-Name': encodeURIComponent(file.name), 'X-Media-Folder': folder },
  }), 'Unable to upload this image.')
}
export async function saveMediaDetails(id, details) {
  return parseJsonResponse(await fetchApi(`/api/admin/media/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
  }), 'Unable to save the image details.')
}
