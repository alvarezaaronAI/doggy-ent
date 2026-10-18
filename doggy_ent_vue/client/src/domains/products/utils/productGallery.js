export function productGallery(product = {}) {
  const images = product.image ? [{ image: product.image, alt: product.name || 'Product photograph' }] : []
  for (const item of (Array.isArray(product.galleryImages) ? product.galleryImages : []).slice(0, 4)) {
    if (item?.image && !images.some(entry => entry.image === item.image)) images.push({ image: item.image, alt: item.alt || product.name || 'Product detail' })
  }
  return images
}
