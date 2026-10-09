import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
import { normalizeProduct } from '../mappers/product.mapper.js'

const PRODUCTS_API_BASE = '/api/products'

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
