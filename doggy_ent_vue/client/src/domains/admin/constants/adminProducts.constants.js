import { SELLING_MODES } from '@shared/constants/sellingMode'

export const PRODUCT_STATUSES = Object.freeze({
  ACTIVE: 'active',
  COMING_SOON: 'coming-soon',
  DRAFT: 'draft',
})

export const PRODUCT_STATUS_CLASSES = Object.freeze({
  [PRODUCT_STATUSES.ACTIVE]: 'bg-green-100 text-green-700',
  [PRODUCT_STATUSES.COMING_SOON]: 'bg-amber-100 text-amber-700',
  [PRODUCT_STATUSES.DRAFT]: 'bg-stone-200 text-stone-700',
})

export const PRODUCT_STATUS_TITLE_CLASSES = Object.freeze({
  [PRODUCT_STATUSES.ACTIVE]: 'text-green-700',
  [PRODUCT_STATUSES.COMING_SOON]: 'text-amber-700',
  [PRODUCT_STATUSES.DRAFT]: 'text-stone-700',
})

export const PRODUCT_STATUS_OPTIONS = Object.freeze([
  {
    value: PRODUCT_STATUSES.DRAFT,
    label: 'draft',
  },
  {
    value: PRODUCT_STATUSES.COMING_SOON,
    label: 'coming-soon',
  },
  {
    value: PRODUCT_STATUSES.ACTIVE,
    label: 'active',
  },
])

export const PRODUCT_STATUS_FILTER_OPTIONS = Object.freeze([
  {
    value: 'all',
    label: 'All Statuses',
  },
  {
    value: PRODUCT_STATUSES.ACTIVE,
    label: 'Active',
  },
  {
    value: PRODUCT_STATUSES.COMING_SOON,
    label: 'Coming Soon',
  },
  {
    value: PRODUCT_STATUSES.DRAFT,
    label: 'Draft',
  },
])

export const ADMIN_PRODUCT_GROUPS = Object.freeze([
  {
    key: PRODUCT_STATUSES.ACTIVE,
    title: 'Active Products',
    emptyMessage: 'No active products.',
    titleClass: PRODUCT_STATUS_TITLE_CLASSES[PRODUCT_STATUSES.ACTIVE],
    countClass: PRODUCT_STATUS_CLASSES[PRODUCT_STATUSES.ACTIVE],
  },
  {
    key: PRODUCT_STATUSES.COMING_SOON,
    title: 'Coming Soon',
    emptyMessage: 'No coming soon products.',
    titleClass: PRODUCT_STATUS_TITLE_CLASSES[PRODUCT_STATUSES.COMING_SOON],
    countClass: PRODUCT_STATUS_CLASSES[PRODUCT_STATUSES.COMING_SOON],
  },
  {
    key: PRODUCT_STATUSES.DRAFT,
    title: 'Draft Products',
    emptyMessage: 'No draft products.',
    titleClass: PRODUCT_STATUS_TITLE_CLASSES[PRODUCT_STATUSES.DRAFT],
    countClass: PRODUCT_STATUS_CLASSES[PRODUCT_STATUSES.DRAFT],
  },
])

export const PRODUCT_CATEGORIES = Object.freeze([
  'Jerky',
  'Bundle',
  'Training',
  'Seasonal',
])

export const PRODUCT_PROTEINS = Object.freeze([
  'Chicken',
  'Beef',
  'Turkey',
  'Lamb',
])

export const PRODUCT_SELLING_MODES = Object.freeze([
  {
    value: SELLING_MODES.INVENTORY_LIMITED,
    label: 'inventory-limited',
  },
  {
    value: SELLING_MODES.MADE_TO_ORDER,
    label: 'made-to-order',
  },
  {
    value: SELLING_MODES.PREORDER,
    label: 'preorder',
  },
])

export const DEFAULT_PRODUCT_SELLING_MODE =
  SELLING_MODES.INVENTORY_LIMITED

export const PRODUCT_VARIANT_SIZES = Object.freeze({
  SIX_OZ: '6 oz',
  EIGHTEEN_OZ: '18 oz',
})

export const PRODUCT_VARIANT_DEFAULTS = Object.freeze({
  SIX_OZ_LOW_STOCK_THRESHOLD: 5,
  EIGHTEEN_OZ_LOW_STOCK_THRESHOLD: 3,
})

export const ADMIN_PRODUCT_REQUIRED_MESSAGE =
  'Please complete all required product fields, including 6 oz and 18 oz prices.'
