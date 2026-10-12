import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { MAX_IMAGE_EDGE, MAX_IMAGE_PIXELS, MAX_STORED_IMAGE_BYTES } from '../../storefront/content/mediaRules.js'
import { mediaError } from '../validators/media.validator.js'

let active = 0
export async function normalizeImage(input, type) {
  if (active >= 2) throw mediaError('Two images are being processed. Please try again shortly.', 429)
  active++
  try {
    const source = sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'warning' })
    const metadata = await source.metadata()
    const types = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
    if (types[metadata.format] !== type || !metadata.width || !metadata.height || (metadata.pages || 1) !== 1) throw mediaError('Upload a valid, non-animated JPEG, PNG, or WebP image.')
    // Re-encoding removes original metadata and keeps uploaded files inert raster images.
    const { data: bytes, info } = await source.rotate().resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true })
    if (bytes.length > MAX_STORED_IMAGE_BYTES) throw mediaError('This image is too detailed after optimization. Choose a smaller image.', 413)
    const thumbnailBytes = await sharp(bytes).resize({ width: 360, height: 240, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toBuffer()
    return { bytes, thumbnailBytes, width: info.width, height: info.height, byteSize: bytes.length, thumbnailByteSize: thumbnailBytes.length, mimeType: 'image/webp', checksum: createHash('sha256').update(bytes).digest('hex') }
  } catch (error) {
    if (error.statusCode) throw error
    throw mediaError('This image cannot be read safely. Use a JPEG, PNG, or WebP under 20 megapixels.')
  } finally { active-- }
}
