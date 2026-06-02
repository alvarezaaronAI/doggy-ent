import { fetchProducts } from '@products/api/products.api'

const PRODUCTS_API_URL = '/api/products'

async function parseProductResponse(response, fallbackMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage)
  }

  return data
}

export { fetchProducts }

export async function createProduct(payload) {
  const response = await fetch(PRODUCTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseProductResponse(
    response,
    'Unable to save product.',
  )
}

export async function updateProduct(productId, payload) {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseProductResponse(
    response,
    'Unable to save product.',
  )
}

export async function deleteProduct(productId) {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
    method: 'DELETE',
  })

  return parseProductResponse(
    response,
    'Unable to delete product.',
  )
}
