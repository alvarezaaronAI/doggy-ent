import { getOrderedProductVariants } from '../utils/productVariants.js'

export function normalizeProduct(product) {
  const variants = getOrderedProductVariants(product).map((variant) => ({
    ...variant,
    price: Number(variant.price ?? 0) / 100,
    quantity: Number(variant.inventory || 0),
    stockStatus:
      Number(variant.inventory || 0) > 0
        ? 'in-stock'
        : product.status === 'COMING_SOON'
          ? 'coming-soon'
          : 'out-of-stock',
  }))
  return {
    ...product,
    shortDescription: product.description || '',
    status: String(product.status || '')
      .toLowerCase()
      .replace(/_/g, '-'),
    sellingMode: String(product.sellingMode || '')
      .toLowerCase()
      .replace(/_/g, '-'),
    variants,
    price: variants[0]?.price ?? 0,
  }
}
