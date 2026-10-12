export function adminReturnPath(value) {
  return typeof value === 'string' && /^\/admin(?:\/|\?|#|$)/.test(value) && !value.includes('\\') ? value : '/admin'
}
