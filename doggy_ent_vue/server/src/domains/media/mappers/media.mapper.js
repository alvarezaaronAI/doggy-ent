import { mediaAssetPath } from '../../storefront/content/mediaRules.js'
export const MEDIA_METADATA_SELECT = { id: true, name: true, originalFilename: true, altText: true, folder: true, mimeType: true, width: true, height: true, byteSize: true, thumbnailByteSize: true, createdAt: true, updatedAt: true }
export function mapMediaAsset(asset) {
  const result = Object.fromEntries(Object.keys(MEDIA_METADATA_SELECT).map(key => [key, asset[key]]))
  return { ...result, url: mediaAssetPath(asset.id), thumbnailUrl: `${mediaAssetPath(asset.id)}/thumbnail` }
}
