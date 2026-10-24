import sharp from 'sharp'
import {
  MAX_PET_PHOTO_BYTES, MAX_PET_PHOTO_EDGE, MAX_PET_PHOTO_PIXELS,
  MAX_PET_PHOTO_UPLOAD_BYTES, PET_PHOTO_TYPES,
} from '../constants/pets.constants.js'

const photoError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode })
let activeTransforms = 0

function isAnimatedPng(input) {
  if (!input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return false
  // libvips can decode only the first APNG frame, so also check its animation-control chunk.
  for (let offset = 8; offset + 12 <= input.length;) {
    const length = input.readUInt32BE(offset)
    if (length > input.length - offset - 12) return false
    if (input.toString('ascii', offset + 4, offset + 8) === 'acTL') return true
    offset += length + 12
  }
  return false
}

export async function normalizePetPhoto(input, type) {
  if (!PET_PHOTO_TYPES.includes(type)) throw photoError('Upload a JPEG, PNG, or WebP image.', 415)
  if (!Buffer.isBuffer(input) || !input.length) throw photoError('Choose a photo to upload.')
  if (input.length > MAX_PET_PHOTO_UPLOAD_BYTES) throw photoError('Photos must be 5 MB or smaller.', 413)
  if (isAnimatedPng(input)) throw photoError('Upload a non-animated JPEG, PNG, or WebP image.')
  if (activeTransforms >= 2) throw photoError('Photos are being processed. Please try again shortly.', 429)
  activeTransforms++
  try {
    const source = sharp(input, { limitInputPixels: MAX_PET_PHOTO_PIXELS, failOn: 'warning' })
    const metadata = await source.metadata()
    const types = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
    if (types[metadata.format] !== type || !metadata.width || !metadata.height
      || metadata.width * metadata.height > MAX_PET_PHOTO_PIXELS || (metadata.pages || 1) !== 1) {
      throw photoError('Upload a valid, non-animated JPEG, PNG, or WebP image.')
    }
    // No keepMetadata/withMetadata: only oriented, resized, re-encoded pixels persist.
    const bytes = await source.rotate().resize({
      width: MAX_PET_PHOTO_EDGE, height: MAX_PET_PHOTO_EDGE, fit: 'inside', withoutEnlargement: true,
    }).webp({ quality: 82, effort: 4 }).toBuffer()
    if (bytes.length > MAX_PET_PHOTO_BYTES) throw photoError('This photo is too detailed. Choose a smaller photo.', 413)
    return { bytes, contentType: 'image/webp' }
  }
  catch (error) {
    if (error.statusCode) throw error
    throw photoError('This photo cannot be read safely. Use a JPEG, PNG, or WebP under 40 megapixels.')
  }
  finally { activeTransforms-- }
}
