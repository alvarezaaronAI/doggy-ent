import { prisma } from '../../../db/prisma.js'
import {
  MAX_WISHLIST_ITEMS,
  WISHLIST_PUBLIC_PRODUCT_STATUSES,
  WISHLIST_SAVE_ATTEMPTS,
} from '../constants/wishlist.constants.js'
import { WISHLIST_ITEM_SELECT } from '../mappers/wishlist.mapper.js'

export function findCustomerWishlist(userId) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    select: WISHLIST_ITEM_SELECT,
    orderBy: [{ createdAt: 'desc' }, { productId: 'asc' }],
    take: MAX_WISHLIST_ITEMS,
  })
}

export async function saveCustomerWishlistItemWithinLimit(userId, productId) {
  for (let attempt = 0; attempt < WISHLIST_SAVE_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(async tx => {
        const product = await tx.product.findFirst({
          where: { id: productId, status: { in: WISHLIST_PUBLIC_PRODUCT_STATUSES } },
          select: { id: true },
        })
        if (!product) return { state: 'unavailable' }

        const existing = await tx.wishlistItem.findUnique({
          where: { userId_productId: { userId, productId } },
          select: WISHLIST_ITEM_SELECT,
        })
        if (existing) return { state: 'saved', item: existing }

        // Capacity and insert use the same serializable snapshot on every retry.
        const count = await tx.wishlistItem.count({ where: { userId } })
        if (count >= MAX_WISHLIST_ITEMS) return { state: 'limit' }
        const item = await tx.wishlistItem.create({
          data: { userId, productId }, select: WISHLIST_ITEM_SELECT,
        })
        return { state: 'saved', item }
      }, { isolationLevel: 'Serializable' })
    }
    catch (error) {
      if (error.code === 'P2003') return { state: 'unavailable' }
      // A competing save can fail either serialization or the composite unique key.
      if (!['P2034', 'P2002'].includes(error.code)) throw error
      if (attempt === WISHLIST_SAVE_ATTEMPTS - 1) {
        throw Object.assign(new Error('Wishlist changed. Please try again.'), { statusCode: 409 })
      }
    }
  }
}

export async function deleteCustomerWishlistItem(userId, productId) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } })
}
