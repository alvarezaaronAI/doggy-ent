import {
  PROMO_STATUSES,
  PROMO_TYPES,
} from '@promos/constants/promo.constants'

export const PROMO_FILTER_ALL = 'all'

export const ADMIN_PROMO_GROUPS = Object.freeze([
  {
    key: 'active',
    title: 'Active promos',
    emptyMessage: 'No active promos match this view.',
    countSuffix: 'active',
    countClass: 'bg-green-50 text-green-700',
  },
  {
    key: 'inactive',
    title: 'Inactive promos',
    emptyMessage: 'No inactive promos match this view.',
    countSuffix: 'inactive',
    countClass: 'bg-stone-100 text-stone-600',
  },
])

export const DEFAULT_PROMO_TEST_FORM = Object.freeze({
  code: '',
  subtotal: 50,
  customerEmail: '',
})

export const UNIQUE_PROMO_CODE_PREFIX = 'VIP'
export const UNIQUE_PROMO_CODE_LENGTH = 12
export const UNIQUE_PROMO_DEFAULT_NAME = 'Unique customer code'

export const DEFAULT_PROMO_TYPE = PROMO_TYPES.GLOBAL
export const DEFAULT_PROMO_STATUS = PROMO_STATUSES.DRAFT
