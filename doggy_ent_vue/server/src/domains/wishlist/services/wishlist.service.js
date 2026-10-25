import { MAX_WISHLIST_ITEMS } from '../constants/wishlist.constants.js'
import { mapWishlistItem } from '../mappers/wishlist.mapper.js'
import {
  deleteCustomerWishlistItem,
  findCustomerWishlist,
  saveCustomerWishlistItemWithinLimit,
} from '../repositories/wishlist.repository.js'
import { validateWishlistProductId } from '../validators/wishlist.validator.js'

function requireOwner(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw Object.assign(new Error('Customer authentication required.'), { statusCode: 401 })
  }
}

export async function getCustomerWishlist(userId) {
  requireOwner(userId)
  return (await findCustomerWishlist(userId)).map(mapWishlistItem)
}

export async function saveCustomerWishlistItem(userId, productId) {
  requireOwner(userId)
  validateWishlistProductId(productId)
  const result = await saveCustomerWishlistItemWithinLimit(userId, productId)
  if (result.state === 'unavailable') {
    throw Object.assign(new Error('Product not available.'), { statusCode: 404 })
  }
  if (result.state === 'limit') {
    throw Object.assign(new Error(`You can save up to ${MAX_WISHLIST_ITEMS} wishlist items.`), { statusCode: 409 })
  }
  return mapWishlistItem(result.item)
}

export async function removeCustomerWishlistItem(userId, productId) {
  requireOwner(userId)
  validateWishlistProductId(productId)
  await deleteCustomerWishlistItem(userId, productId)
  return { removed: true }
}
