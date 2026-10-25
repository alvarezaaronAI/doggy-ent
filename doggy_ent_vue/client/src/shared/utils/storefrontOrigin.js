export function normalizeStorefrontOrigin(value, { allowLocal = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value.trim())
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') return ''
    if (local && !allowLocal) return ''
    if (url.protocol !== 'https:' && !(allowLocal && local && url.protocol === 'http:')) return ''
    return url.origin
  } catch {
    return ''
  }
}
