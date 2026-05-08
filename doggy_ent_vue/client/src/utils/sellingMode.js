

export const SELLING_MODES = Object.freeze({
  INVENTORY_LIMITED: 'inventory-limited',
  MADE_TO_ORDER: 'made-to-order',
  PREORDER: 'preorder',
})

export const INVENTORY_IGNORE_MODES = Object.freeze([
  SELLING_MODES.MADE_TO_ORDER,
  SELLING_MODES.PREORDER,
])

export function getSellingMode(product) {
  return String(product?.sellingMode || SELLING_MODES.INVENTORY_LIMITED).trim().toLowerCase()
}

export function canIgnoreInventory(product) {
  return INVENTORY_IGNORE_MODES.includes(getSellingMode(product))
}

export function isInventoryLimited(product) {
  return getSellingMode(product) === SELLING_MODES.INVENTORY_LIMITED
}

export function isPurchasable(product, variant) {
  if (!product || product.status !== 'active' || !variant) return false

  if (canIgnoreInventory(product)) return true

  return variant.stockStatus === 'in-stock' && Number(variant.quantity || 0) > 0
}

export function getAvailableQuantity(product, variant) {
  if (canIgnoreInventory(product)) return Number.POSITIVE_INFINITY

  return Number(variant?.quantity || 0)
}

export function limitQuantity(product, requestedQuantity, availableQuantity) {
  if (canIgnoreInventory(product)) return requestedQuantity

  return Math.min(requestedQuantity, availableQuantity)
}

export function getStockLabel(product, variant) {
  if (!variant) return 'Unavailable'

  const mode = getSellingMode(product)

  if (mode === SELLING_MODES.MADE_TO_ORDER) return 'Made to order'
  if (mode === SELLING_MODES.PREORDER) return 'Preorder'

  if (variant.stockStatus === 'out-of-stock' || Number(variant.quantity || 0) <= 0) {
    return 'Out of stock'
  }

  if (Number(variant.quantity || 0) <= Number(variant.lowStockThreshold || 0)) {
    return 'Low stock'
  }

  return 'In stock'
}