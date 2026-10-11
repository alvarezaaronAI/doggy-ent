import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
export function getFeaturedProduct(products, productId = '') {
  return products.find((product) => product.status === 'active' && product.id === productId)
    || products.find((product) => product.status === 'active' && product.featured)
    || products.find((product) => product.status === 'active') || null
}
export function getHomeFeaturedProduct(content, products) {
  return getFeaturedProduct(products, content.sections.find((section) => section.type === 'spotlight')?.settings.productId)
}
export function resolveSectionSettings(block) { return sectionSettings(block.type, block.settings) }
export function sectionBackground(settings) {
  const colors = { white: '#ffffff', oat: '#fcf7ea', giving: '#edf6f0' }
  return {
    ...(colors[settings.background] ? { backgroundColor: colors[settings.background] } : {}),
    ...(settings.backgroundImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,.70),rgba(255,255,255,.70)), url(${JSON.stringify(mediaImageSource(settings.backgroundImage))})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
  }
}
