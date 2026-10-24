export function safeAccountReturn(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || /[\\\s]/.test(value) || value.startsWith('//')) return ''
  try {
    const url = new URL(value, 'https://shop.invalid')
    if (url.origin !== 'https://shop.invalid' || /^\/(?:admin|api)(?:\/|$)/.test(url.pathname)
      || /^\/account\/(?:sign-in|create|forgot-password|reset-password)(?:\/|$)/.test(url.pathname)) return ''
    return url.pathname + url.search + url.hash
  } catch { return '' }
}

export function accountRedirectQuery(value) {
  const redirect = safeAccountReturn(value)
  return redirect ? { redirect } : {}
}
