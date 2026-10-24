import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
const base = '/api/account/pets'
async function request(path = '', options) {
  const response = await fetchApi(base + path, options)
  const data = await parseJsonResponse(response, 'Unable to update your pets right now. Please try again.')
  if (!data || !Object.hasOwn(data, 'result')) throw new Error('Unable to update your pets right now. Please try again.')
  return data.result
}
export const fetchAccountPets = () => request()
export function saveAccountPet(id, values) {
  return request(id ? `/${encodeURIComponent(id)}` : '', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
}
export const deleteAccountPet = id => request(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const archiveAccountPet = (id, archived) => request(`/${encodeURIComponent(id)}/archive`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived }) })
export const uploadAccountPetPhoto = (id, file) => request(`/${encodeURIComponent(id)}/photo`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
export const deleteAccountPetPhoto = id => request(`/${encodeURIComponent(id)}/photo`, { method: 'DELETE' })
export async function fetchAccountPetPhoto(id, signal) {
  const response = await fetchApi(`${base}/${encodeURIComponent(id)}/photo`, { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('Photo unavailable.')
  if (!(response.headers.get('content-type') || '').startsWith('image/webp')) throw new Error('Photo unavailable.')
  return response.blob()
}
