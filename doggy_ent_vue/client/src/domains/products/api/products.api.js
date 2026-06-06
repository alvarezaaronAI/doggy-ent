
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const PRODUCTS_API_BASE = '/api/products'

function normalizeVariant(product, variant) {
  return {
    ...variant,
    price: Number(variant.price || 0) / 100,
    quantity: Number(variant.inventory || 0),
    stockStatus:
      Number(variant.inventory || 0) > 0
        ? 'in-stock'
        : product.status === 'COMING_SOON'
          ? 'coming-soon'
          : 'out-of-stock',
  }
}

function normalizeProduct(product) {
  return {
    ...product,
    shortDescription: product.description || '',
    status: String(product.status || '').toLowerCase().replace(/_/g, '-'),
    sellingMode: String(product.sellingMode || '').toLowerCase().replace(/_/g, '-'),
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => normalizeVariant(product, variant))
      : [],
  }
}

export async function fetchProducts() {
  const data = await parseJsonResponse(
    await fetchApi(PRODUCTS_API_BASE),
    'Unable to load products.',
  )

  const products = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : []

  return products.map(normalizeProduct)
}

export async function fetchProductBySlug(slug) {
  const product = await parseJsonResponse(
    await fetchApi(`${PRODUCTS_API_BASE}/${slug}`),
    'Unable to load product.',
  )

  return normalizeProduct(product)
}
