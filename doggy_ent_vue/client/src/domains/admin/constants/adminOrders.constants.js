export const ORDER_FILTER_ALL = 'all'

export const ORDER_STATUSES = Object.freeze({
  CANCELLED: 'CANCELLED',
  DELIVERED: 'DELIVERED',
  PAID: 'PAID',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
})

export const ORDER_STATUS_FILTER_OPTIONS = Object.freeze([
  {
    value: ORDER_FILTER_ALL,
    label: 'All statuses',
  },
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'not_paid',
    label: 'Not paid',
  },
  {
    value: 'paid',
    label: 'Paid',
  },
  {
    value: 'refunded',
    label: 'Refunded',
  },
  {
    value: 'unfulfilled',
    label: 'Unfulfilled',
  },
  {
    value: 'packed',
    label: 'Packed',
  },
  {
    value: 'shipped',
    label: 'Shipped',
  },
  {
    value: 'fulfilled',
    label: 'Fulfilled',
  },
])

export const ORDER_TIMELINE_STEPS = Object.freeze([
  {
    key: 'paid',
    label: 'Paid',
  },
  {
    key: 'packed',
    label: 'Packed',
  },
  {
    key: 'shipped',
    label: 'Shipped',
  },
  {
    key: 'fulfilled',
    label: 'Fulfilled',
  },
])

export const ORDER_GROUP_CONFIG = Object.freeze([
  {
    key: 'needs-attention',
    title: 'Needs attention',
    description: 'Orders that need review before fulfillment.',
    countSuffix: 'need attention',
  },
  {
    key: 'ready-to-fulfill',
    title: 'Ready to fulfill',
    description: 'Paid orders waiting to be packed, shipped, or completed.',
    countSuffix: 'ready',
  },
  {
    key: 'fulfilled',
    title: 'Fulfilled',
    description: 'Completed orders kept here for quick reference.',
    countSuffix: 'fulfilled',
  },
  {
    key: 'cancelled',
    title: 'Cancelled',
    description: 'Cancelled orders separated from active operations.',
    countSuffix: 'cancelled',
  },
])

export const DEFAULT_ORDER_STATS = Object.freeze({
  totalOrders: 0,
  pendingOrders: 0,
  paidOrders: 0,
  fulfilledOrders: 0,
  totalRevenue: 0,
  totalDonationGenerated: 0,
})
