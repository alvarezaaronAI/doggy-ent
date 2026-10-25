export function validateEmptyWishlistInput(input) {
  if (input === undefined) return
  if (input === null || typeof input !== 'object'
    || ![Object.prototype, null].includes(Object.getPrototypeOf(input))
    || Object.keys(input).length) {
    throw Object.assign(new Error('Wishlist requests do not accept extra data.'), { statusCode: 400 })
  }
}

export function validateWishlistProductId(productId) {
  if (typeof productId !== 'string' || !/^c[a-z0-9]{24}$/.test(productId)) {
    throw Object.assign(new Error('Check the product selection.'), { statusCode: 400 })
  }
  return productId
}
