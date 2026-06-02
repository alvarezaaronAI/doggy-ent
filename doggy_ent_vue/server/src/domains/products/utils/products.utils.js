export function normalizeInventoryQuantity(value) {
  return Math.max(
    0,
    Number.parseInt(value || 0, 10),
  )
}

export function slugifyProduct(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function buildVariantSku(productInput, size) {
  return `CNE-DT-${slugifyProduct(
    productInput.protein || productInput.name
  ).toUpperCase()}-${size.replace(/\s+/g, '').toUpperCase()}`
}

export function toPrismaEnum(value) {
  return value?.toUpperCase().replace(/-/g, '_')
}
