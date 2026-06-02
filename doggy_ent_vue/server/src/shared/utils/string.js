export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function normalizeOptionalString(value) {
  const normalized = String(value || '').trim()

  return normalized || null
}

export function normalizeNullableNumber(value) {
  if (
    value === ''
    || value === null
    || value === undefined
  ) {
    return null
  }

  const normalized = Number(value)

  return Number.isNaN(normalized)
    ? null
    : normalized
}

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}
