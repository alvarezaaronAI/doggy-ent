import { fetchProducts } from '@products/api/products.api'
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const PRODUCTS_API_URL = '/api/products'

export { fetchProducts }

export async function createProduct(payload) {
  const response = await fetchApi(PRODUCTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse(
    response,
    'Unable to save product.',
  )
}

export async function updateProduct(productId, payload) {
  const response = await fetchApi(`${PRODUCTS_API_URL}/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse(
    response,
    'Unable to save product.',
  )
}

export async function deleteProduct(productId) {
  const response = await fetchApi(`${PRODUCTS_API_URL}/${productId}`, {
    method: 'DELETE',
  })

  return parseJsonResponse(
    response,
    'Unable to delete product.',
  )
}
