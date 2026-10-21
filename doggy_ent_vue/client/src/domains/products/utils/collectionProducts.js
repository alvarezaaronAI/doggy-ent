import { isCollectionProduct } from './productVisibility.js'

export function collectionProducts(products, { productIds = [], id = 'shop', sort = 'featured' } = {}) {
  const rank = new Map(productIds.map((value, index) => [value, index]))
  // The main shop is the full catalog. Extra collections may be deliberately curated.
  const visible = products.filter(product => isCollectionProduct(product) &&
    (id === 'shop' || !rank.size || rank.has(product.id)))

  if (sort !== 'featured' || !rank.size) return visible
  return visible.sort((a, b) => (rank.get(a.id) ?? rank.size) - (rank.get(b.id) ?? rank.size))
}
