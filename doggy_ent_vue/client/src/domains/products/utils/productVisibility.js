export function isCollectionProduct(product) {
  return ['active', 'out-of-stock'].includes(product.status) ||
    product.isTestProduct === true && product.status === 'coming-soon'
}
