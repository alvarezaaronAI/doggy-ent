export function formatAdminProductPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
