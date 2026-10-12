import { buildApiUrl } from '@shared/api/http.js'
import { getMediaAssetId } from '@storefront-content/mediaRules.js'

export function mediaImageSource(value) {
  if (getMediaAssetId(value)) return buildApiUrl(value)
  if (typeof value === 'string' && value.endsWith('/thumbnail') && getMediaAssetId(value.slice(0, -10))) return buildApiUrl(value)
  return value || ''
}
