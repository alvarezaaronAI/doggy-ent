import {
  DISCOUNT_TYPES,
  PROMO_STATUSES,
  PROMO_TYPES,
} from '../constants/promo.constants'

export function formatPromoDiscount(promo) {
  if (!promo) {
    return ''
  }

  if (promo.discountType === DISCOUNT_TYPES.PERCENT) {
    return `${promo.discountValue}% OFF`
  }

  return `$${Number(promo.discountValue || 0).toFixed(2)} OFF`
}

export function formatPromoUsageLimit(limit) {
  if (limit === null || limit === undefined) {
    return 'Unlimited'
  }

  return String(limit)
}

export function formatPromoStatus(status) {
  switch (status) {
    case PROMO_STATUSES.ACTIVE:
      return 'Active'

    case PROMO_STATUSES.DRAFT:
      return 'Draft'

    case PROMO_STATUSES.EXPIRED:
      return 'Expired'

    case PROMO_STATUSES.DISABLED:
      return 'Disabled'

    case PROMO_STATUSES.ARCHIVED:
      return 'Archived'

    default:
      return 'Unknown'
  }
}

export function getPromoStatusClass(status) {
  switch (status) {
    case PROMO_STATUSES.ACTIVE:
      return 'is-success'

    case PROMO_STATUSES.DRAFT:
      return 'is-warning'

    case PROMO_STATUSES.EXPIRED:
      return 'is-danger'

    case PROMO_STATUSES.DISABLED:
      return 'is-dark'

    case PROMO_STATUSES.ARCHIVED:
      return 'is-light'

    default:
      return 'is-light'
  }
}

export function formatPromoType(type) {
  switch (type) {
    case PROMO_TYPES.GLOBAL:
      return 'Global'

    case PROMO_TYPES.UNIQUE:
      return 'Unique'

    case PROMO_TYPES.REFERRAL:
      return 'Referral'

    default:
      return 'Unknown'
  }
}

export function isUnlimitedPromo(limit) {
  return limit === null || limit === undefined
}
