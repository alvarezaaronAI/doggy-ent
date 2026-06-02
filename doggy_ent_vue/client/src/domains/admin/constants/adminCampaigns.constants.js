export const CAMPAIGN_FILTER_ALL = 'all'

export const CAMPAIGN_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
})

export const DONATION_TYPES = Object.freeze({
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
})

export const CAMPAIGN_STATUS_OPTIONS = Object.freeze([
  {
    value: CAMPAIGN_STATUSES.DRAFT,
    label: 'Draft',
  },
  {
    value: CAMPAIGN_STATUSES.ACTIVE,
    label: 'Active',
  },
  {
    value: CAMPAIGN_STATUSES.PAUSED,
    label: 'Paused',
  },
  {
    value: CAMPAIGN_STATUSES.ENDED,
    label: 'Ended',
  },
])

export const CAMPAIGN_STATUS_FILTER_OPTIONS = Object.freeze([
  {
    value: CAMPAIGN_FILTER_ALL,
    label: 'All statuses',
  },
  {
    value: CAMPAIGN_STATUSES.ACTIVE,
    label: 'Active',
  },
  {
    value: CAMPAIGN_STATUSES.DRAFT,
    label: 'Draft',
  },
  {
    value: CAMPAIGN_STATUSES.PAUSED,
    label: 'Paused',
  },
  {
    value: CAMPAIGN_STATUSES.ENDED,
    label: 'Ended',
  },
])

export const DONATION_TYPE_OPTIONS = Object.freeze([
  {
    value: DONATION_TYPES.PERCENT,
    label: 'Percent of product sales',
  },
  {
    value: DONATION_TYPES.FIXED,
    label: 'Fixed amount',
  },
])

export const CAMPAIGN_STATUS_CLASSES = Object.freeze({
  [CAMPAIGN_STATUSES.ACTIVE]: 'bg-green-50 text-green-700',
  [CAMPAIGN_STATUSES.ENDED]: 'bg-red-50 text-red-700',
  [CAMPAIGN_STATUSES.PAUSED]: 'bg-amber-50 text-amber-700',
  [CAMPAIGN_STATUSES.DRAFT]: 'bg-stone-100 text-stone-500',
})

export const ADMIN_CAMPAIGN_GROUPS = Object.freeze([
  {
    key: 'active',
    title: 'Active campaigns',
    emptyMessage: 'No active campaigns match this view.',
    countSuffix: 'active',
    countClass: 'bg-green-50 text-green-700',
  },
  {
    key: 'inactive',
    title: 'Draft, paused & ended campaigns',
    emptyMessage: 'No inactive campaigns match this view.',
    countSuffix: 'inactive',
    countClass: 'bg-stone-100 text-stone-600',
  },
])
