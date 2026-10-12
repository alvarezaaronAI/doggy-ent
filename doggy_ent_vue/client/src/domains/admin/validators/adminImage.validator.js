import { IMAGE_UPLOAD_TYPES, MAX_IMAGE_UPLOAD_BYTES } from '@storefront-content/mediaRules.js'
export function validateImageFile(file) {
  if (!file || !IMAGE_UPLOAD_TYPES.includes(file.type)) return 'Choose a JPEG, PNG, or WebP image.'
  if (!file.size || file.size > MAX_IMAGE_UPLOAD_BYTES) return 'Images must be non-empty and 8 MB or smaller.'
  return ''
}
