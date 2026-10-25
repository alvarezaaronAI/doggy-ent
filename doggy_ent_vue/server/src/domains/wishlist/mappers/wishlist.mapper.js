export const WISHLIST_ITEM_SELECT = { productId: true, createdAt: true }

export function mapWishlistItem(item) {
  return { productId: item.productId, createdAt: item.createdAt }
}
