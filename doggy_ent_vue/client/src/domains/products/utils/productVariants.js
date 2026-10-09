const SIZE_ORDER = ['6 oz', '18 oz']

export function getOrderedProductVariants(product) {
  return (Array.isArray(product?.variants) ? product.variants : [])
    .filter((variant) => variant && variant.isActive !== false && variant.size)
    .slice()
    .sort((a, b) => {
      const aIndex = SIZE_ORDER.indexOf(a.size)
      const bIndex = SIZE_ORDER.indexOf(b.size)
      return (
        (aIndex < 0 ? SIZE_ORDER.length : aIndex) -
          (bIndex < 0 ? SIZE_ORDER.length : bIndex) ||
        String(a.size).localeCompare(String(b.size), undefined, {
          numeric: true,
        })
      )
    })
}

export function getProductVariantPrice(product, size) {
  const variant = getOrderedProductVariants(product).find(
    (item) => item.size === size,
  )
  const value = Number(variant?.price ?? product?.price ?? 0)
  return Number.isFinite(value) ? value : 0
}
