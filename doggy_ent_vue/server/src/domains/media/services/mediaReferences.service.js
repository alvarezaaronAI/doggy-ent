import { getMediaAssetId } from '../../storefront/content/mediaRules.js'
import { countMediaIds } from '../repositories/media.repository.js'
import { mediaError } from '../validators/media.validator.js'

export async function assertMediaImagesExist(values) {
  const ids = [...new Set(values.map(getMediaAssetId).filter(Boolean))]
  if (ids.length && await countMediaIds(ids) !== ids.length) throw mediaError('An uploaded image is unavailable in the selected database. Choose it again from this image library.')
}
