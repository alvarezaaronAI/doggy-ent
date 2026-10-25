import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
const base = '/api/account/wishlist'
async function request(path = '', options) {
  const response = await fetchApi(base + path, { cache: 'no-store', ...options })
  try {
    const data = await parseJsonResponse(response, 'Your wishlist is unavailable. Please try again.')
    if (!data || !Object.hasOwn(data, 'result')) throw new Error('Invalid wishlist response.')
    return data.result
  } catch (error) { error.status = response.status; throw error }
}
export const fetchAccountWishlist = () => request()
export const saveWishlistProduct = productId => request(`/${encodeURIComponent(productId)}`, { method: 'PUT' })
export const removeWishlistProduct = productId => request(`/${encodeURIComponent(productId)}`, { method: 'DELETE' })
