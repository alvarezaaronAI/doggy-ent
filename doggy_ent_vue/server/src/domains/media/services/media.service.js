import { normalizeImage } from '../utils/normalizeImage.js'
import { mapMediaAsset } from '../mappers/media.mapper.js'
import { findMediaBytes, listMediaAssets, storeMediaAsset, updateMediaDetails } from '../repositories/media.repository.js'
import { mediaError, validateMediaDetails, validateMediaId, validateMediaQuery, validateUpload } from '../validators/media.validator.js'

export async function uploadImage(bytes, { type, filename, folder = 'general' }) {
  const details = validateUpload(bytes, type, filename, folder)
  const image = await normalizeImage(bytes, type)
  const name = details.originalFilename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Uploaded image'
  const result = await storeMediaAsset(image, { ...details, name, altText: '' })
  if (result.capacityExceeded) throw mediaError('The image library has reached its 256 MB capacity. Review storage before adding more images.', 409)
  return { asset: mapMediaAsset(result.asset), reused: result.reused }
}

export async function getMediaLibrary(query) {
  const result = await listMediaAssets(validateMediaQuery(query))
  return { ...result, assets: result.assets.map(mapMediaAsset) }
}

export async function getPublicImage(id, thumbnail = false) {
  const asset = await findMediaBytes(validateMediaId(id), thumbnail)
  if (!asset?.data) throw mediaError('Image not found.', 404)
  return { bytes: Buffer.from(thumbnail ? asset.data.thumbnailBytes : asset.data.bytes), mimeType: asset.mimeType, etag: `"${asset.checksum}${thumbnail ? '-thumbnail' : ''}"` }
}

export async function editMediaDetails(id, input) {
  validateMediaId(id)
  const data = validateMediaDetails(input)
  try { return { asset: mapMediaAsset(await updateMediaDetails(id, data)) } }
  catch (error) { if (error.code === 'P2025') throw mediaError('Image not found.', 404); throw error }
}

