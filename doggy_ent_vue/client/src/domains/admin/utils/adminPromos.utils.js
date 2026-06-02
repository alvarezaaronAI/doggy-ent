import {
  UNIQUE_PROMO_CODE_LENGTH,
  UNIQUE_PROMO_CODE_PREFIX,
} from '../constants/adminPromos.constants'

export function formatAdminPromoPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export function getSecureRandomPromoCode(
  length = UNIQUE_PROMO_CODE_LENGTH,
) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const randomValues = new Uint32Array(length)
  window.crypto.getRandomValues(randomValues)

  return `${UNIQUE_PROMO_CODE_PREFIX}-${
    Array.from(
      randomValues,
      (value) => alphabet[value % alphabet.length],
    ).join('')
  }`
}
