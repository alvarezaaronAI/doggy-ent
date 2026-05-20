export const PROMO_TYPES = {
  GLOBAL: 'GLOBAL',
  UNIQUE: 'UNIQUE',
  REFERRAL: 'REFERRAL',
}

export const PROMO_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  DISABLED: 'DISABLED',
  ARCHIVED: 'ARCHIVED',
}

export const DISCOUNT_TYPES = {
  FIXED: 'FIXED',
  PERCENT: 'PERCENT',
}

export const PROMO_TYPE_OPTIONS = [
  {
    label: 'Global',
    value: PROMO_TYPES.GLOBAL,
  },
  {
    label: 'Unique',
    value: PROMO_TYPES.UNIQUE,
  },
  {
    label: 'Referral',
    value: PROMO_TYPES.REFERRAL,
  },
]

export const PROMO_STATUS_OPTIONS = [
  {
    label: 'Draft',
    value: PROMO_STATUSES.DRAFT,
  },
  {
    label: 'Active',
    value: PROMO_STATUSES.ACTIVE,
  },
  {
    label: 'Expired',
    value: PROMO_STATUSES.EXPIRED,
  },
  {
    label: 'Disabled',
    value: PROMO_STATUSES.DISABLED,
  },
]

export const DISCOUNT_TYPE_OPTIONS = [
  {
    label: 'Fixed Amount',
    value: DISCOUNT_TYPES.FIXED,
  },
  {
    label: 'Percentage',
    value: DISCOUNT_TYPES.PERCENT,
  },
]
