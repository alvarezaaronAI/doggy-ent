import { IMAGE_UPLOAD_TYPES, MAX_IMAGE_UPLOAD_BYTES, MEDIA_FOLDERS, MEDIA_ID_PATTERN } from '../../storefront/content/mediaRules.js'

export function mediaError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode })
}

export function validateUpload(bytes, type, filename, folder) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) throw mediaError('Choose a JPEG, PNG, or WebP image.')
  if (bytes.length > MAX_IMAGE_UPLOAD_BYTES) throw mediaError('Images must be 8 MB or smaller.', 413)
  if (!IMAGE_UPLOAD_TYPES.includes(type)) throw mediaError('Only JPEG, PNG, and WebP images are supported.', 415)
  if (!MEDIA_FOLDERS.includes(folder)) throw mediaError('Choose a supported image folder.')
  let originalFilename
  try { originalFilename = decodeURIComponent(filename || 'image').split(/[\\/]/).at(-1).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 160) }
  catch { throw mediaError('The image filename is invalid.') }
  return { originalFilename: originalFilename || 'image', folder }
}

export function validateMediaQuery(query) {
  const search = query.search ?? '', folder = query.folder ?? '', page = query.page ?? '1'
  if (typeof search !== 'string' || search.length > 160 || typeof folder !== 'string' || (folder && !MEDIA_FOLDERS.includes(folder))) throw mediaError('Check the image search and folder.')
  if (typeof page !== 'string' || !/^[1-9]\d{0,4}$/.test(page)) throw mediaError('Choose a valid image page.')
  return { search: search.trim(), folder, page: Number(page) }
}

export function validateMediaDetails(input) {
  if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 160 || typeof input.altText !== 'string' || input.altText.length > 240 || !MEDIA_FOLDERS.includes(input.folder)) throw mediaError('Add an image name, description up to 240 characters, and supported folder.')
  return { name: input.name.trim(), altText: input.altText.trim(), folder: input.folder }
}

export function validateMediaId(id) {
  if (!MEDIA_ID_PATTERN.test(id || '')) throw mediaError('Image not found.', 404)
  return id
}
