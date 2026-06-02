export function validateProductPayload(productInput) {
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
    variants.length >= 2 &&
    variants.every((variant) => Number(variant.price) > 0)

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
