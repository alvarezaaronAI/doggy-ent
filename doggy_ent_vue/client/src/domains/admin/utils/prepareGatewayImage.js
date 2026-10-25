import { IMAGE_UPLOAD_TYPES, MAX_IMAGE_EDGE, MAX_IMAGE_PIXELS, MAX_IMAGE_UPLOAD_BYTES } from '@storefront-content/mediaRules.js'

export const GATEWAY_IMAGE_BYTES = 3 * 1024 * 1024

export async function prepareGatewayImage(file) {
  if (!IMAGE_UPLOAD_TYPES.includes(file?.type) || !file.size || file.size > MAX_IMAGE_UPLOAD_BYTES) throw new Error('Choose a JPEG, PNG, or WebP image, 8 MB or smaller.')
  if (file.size <= GATEWAY_IMAGE_BYTES) return file
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) throw new Error('invalid image')
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('image canvas unavailable')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    // Keep accepted 8 MB originals usable through Vercel's smaller request limit.
    for (const quality of [0.9, 0.8, 0.65]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality))
      if (blob?.type === 'image/webp' && blob.size && blob.size <= GATEWAY_IMAGE_BYTES) return blob
    }
  } catch {
    throw new Error('This image could not be optimized for upload. Try a smaller JPEG, PNG, or WebP.')
  } finally {
    bitmap?.close()
  }
  throw new Error('This image is still too large after optimization. Try a smaller image.')
}
