export const CHECKOUT_RECOVERY_KEY = 'doggy-ent-checkout-recovery:v1'
export const RECOVERY_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const digest = /^[0-9a-f]{64}$/

export async function cartFingerprint(items) {
  const rows = items.map(item => [String(item.productId || item.id || ''), String(item.size || item.selectedSize || item.variant?.size || ''), Number(item.quantity)])
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  const bytes = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(rows)))
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('')
}

export function readCheckoutRecovery(now = Date.now()) {
  const raw = globalThis.localStorage.getItem(CHECKOUT_RECOVERY_KEY)
  if (!raw) return null
  if (raw.length > 1024) throw new Error('Invalid recovery record')
  const record = JSON.parse(raw)
  const expiry = Date.parse(record?.expiresAt)
  if (!uuid.test(record?.id) || !digest.test(record?.cartFingerprint) || !Number.isFinite(expiry)
    || expiry > now + RECOVERY_LIFETIME_MS || (record.token !== '' && !digest.test(record?.token))) {
    throw new Error('Invalid recovery record')
  }
  // A seven-day resource capability is not an auth session. Keep only an expired
  // non-secret marker afterward, so reload cannot silently invite another charge.
  if (expiry <= now) {
    const expired = { id: record.id, token: '', expiresAt: record.expiresAt, cartFingerprint: record.cartFingerprint }
    globalThis.localStorage.setItem(CHECKOUT_RECOVERY_KEY, JSON.stringify(expired))
    return expired
  }
  if (!record.token) throw new Error('Invalid recovery record')
  return { id: record.id, token: record.token, expiresAt: record.expiresAt, cartFingerprint: record.cartFingerprint }
}

export function saveCheckoutRecovery(record) {
  const serialized = JSON.stringify({ id: record.id, token: record.token, expiresAt: record.expiresAt, cartFingerprint: record.cartFingerprint })
  globalThis.localStorage.setItem(CHECKOUT_RECOVERY_KEY, serialized)
  if (globalThis.localStorage.getItem(CHECKOUT_RECOVERY_KEY) !== serialized) throw new Error('Recovery storage unavailable')
}

export function newCheckoutRecovery(fingerprint, now = Date.now()) {
  return {
    id: globalThis.crypto.randomUUID(),
    token: Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join(''),
    expiresAt: new Date(now + RECOVERY_LIFETIME_MS).toISOString(),
    cartFingerprint: fingerprint,
  }
}

export function removeCheckoutRecovery(record) {
  const current = readCheckoutRecovery()
  if (current?.id !== record.id || current?.token !== record.token) throw new Error('Recovery changed')
  globalThis.localStorage.removeItem(CHECKOUT_RECOVERY_KEY)
}

export async function clearRecoveredCart(key, fingerprint) {
  const raw = globalThis.localStorage.getItem(key)
  const items = JSON.parse(raw || '[]')
  if (!Array.isArray(items) || await cartFingerprint(items) !== fingerprint) return false
  if (globalThis.localStorage.getItem(key) !== raw) return false
  globalThis.localStorage.setItem(key, '[]')
  return true
}
