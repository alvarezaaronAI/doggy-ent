export function getPublishableKeyMode(key) {
  if (typeof key !== 'string') return null
  const match = /^pk_(test|live)_[A-Za-z0-9]+$/.exec(key)
  if (!match || match[0] !== key) return null
  return match[1] === 'test' ? 'sandbox' : 'live'
}
