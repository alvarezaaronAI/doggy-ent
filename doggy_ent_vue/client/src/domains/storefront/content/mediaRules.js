// Generated from shared/storefront. Edit the canonical file, then run client and server builds.
export const MEDIA_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024
export const MAX_STORED_IMAGE_BYTES = 2 * 1024 * 1024
export const MAX_IMAGE_PIXELS = 20_000_000
export const MAX_IMAGE_EDGE = 2400
export const IMAGE_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MEDIA_FOLDERS = ['general', 'website', 'products', 'campaigns']

export function getMediaAssetId(value) {
  if (typeof value !== 'string' || !value.startsWith('/api/media/')) return ''
  const id = value.slice('/api/media/'.length)
  return MEDIA_ID_PATTERN.test(id) ? id : ''
}

export function mediaAssetPath(id) {
  return MEDIA_ID_PATTERN.test(id) ? `/api/media/${id}` : ''
}
