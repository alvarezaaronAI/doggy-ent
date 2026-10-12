export function validateProductPayload(productInput) {
  const invalid = { statusCode: 400, message: 'Check required product fields, sizes, prices and inventory.' }
  if (!productInput || typeof productInput !== 'object' || Array.isArray(productInput)) return invalid
  const {
    name,
    shortDescription,
    category,
    status,
    image,
    variants,
  } = productInput

  const hasVariantPrices =
    Array.isArray(variants) &&
    variants.length === 2 &&
    ['6 oz', '18 oz'].every(size => variants.some(variant => variant?.size === size)) &&
    variants.every(variant => variant && Number.isFinite(Number(variant.price)) && Number(variant.price) > 0 && Number(variant.price) <= 1_000_000
      && (variant.quantity == null || Number.isSafeInteger(Number(variant.quantity)) && Number(variant.quantity) >= 0 && Number(variant.quantity) <= 2_147_483_647)
      && (variant.isActive == null || typeof variant.isActive === 'boolean'))

  if ([name, shortDescription, category, status, image].some(value => typeof value !== 'string')
    || name.length > 160 || shortDescription.length > 2000 || image.length > 2048
    || !['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON', 'ARCHIVED'].includes(status.toUpperCase().replaceAll('-', '_'))
    || productInput.sellingMode && !['MADE_TO_ORDER', 'INVENTORY_LIMITED', 'PREORDER'].includes(String(productInput.sellingMode).toUpperCase().replaceAll('-', '_'))) return invalid

  if (
    name
    && shortDescription
    && category
    && status
    && image
    && hasVariantPrices
  ) {
    return null
  }

  return {
    statusCode: 400,
    message: 'Missing required product fields or variant prices.',
  }
}
