import { isSafeContentUrl } from '../../storefront/content/contentValidation.js'

export function validateProductImages(input) {
  const fail = message => Object.assign(new Error(message), { statusCode: 400 })
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some(key => !['image', 'galleryImages', 'updatedAt'].includes(key))) throw fail('Unsupported image settings.')
  if (!input.image || !isSafeContentUrl(input.image, { image: true })) throw fail('Choose a main image from the library or an HTTPS URL.')
  if (!Array.isArray(input.galleryImages) || input.galleryImages.length > 4) throw fail('Use up to four additional images.')
  const galleryImages = input.galleryImages.map(item => {
    if (!item || Object.keys(item).some(key => !['image', 'alt'].includes(key))
      || !item.image || !isSafeContentUrl(item.image, { image: true })
      || typeof item.alt !== 'string' || !item.alt.trim() || item.alt.length > 240) throw fail('Each detail image needs a valid image and a description of up to 240 characters.')
    return { image: item.image, alt: item.alt.trim() }
  })
  if (typeof input.updatedAt !== 'string' || !Number.isFinite(Date.parse(input.updatedAt))) throw fail('Reload the product before saving images.')
  return { image: input.image, galleryImages, updatedAt: new Date(input.updatedAt) }
}
