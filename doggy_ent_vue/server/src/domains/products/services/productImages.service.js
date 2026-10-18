import { assertMediaImagesExist } from '../../media/services/mediaReferences.service.js'
import { findImageProduct, writeProductImages } from '../repositories/productImages.repository.js'
import { validateProductImages } from '../validators/productImages.validator.js'
import { mapProductWithDisplayPrice } from '../mappers/products.mapper.js'

export async function saveProductImages(id, input) {
  const data = validateProductImages(input)
  await assertMediaImagesExist([data.image, ...data.galleryImages.map(item => item.image)])
  if (!(await findImageProduct(id))) throw Object.assign(new Error('Product not found.'), { statusCode: 404 })
  const result = await writeProductImages(id, data)
  if (!result.count) throw Object.assign(new Error('This product changed in another editor. Reload before saving; your images have not been overwritten.'), { statusCode: 409 })
  return mapProductWithDisplayPrice(await findImageProduct(id))
}
