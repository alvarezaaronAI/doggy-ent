export const ORDER_FILTER_ALL = 'all'

export const ORDER_STATUSES = Object.freeze({
  CANCELLED: 'CANCELLED',
  DELIVERED: 'DELIVERED',
  PAID: 'PAID',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  REFUNDED: 'REFUNDED',
  SHIPPED: 'SHIPPED',
})

export const ORDER_STATUS_FILTER_OPTIONS = Object.freeze([
  {
    value: ORDER_FILTER_ALL,
    label: 'All statuses',
  },
  {
    value: ORDER_STATUSES.PENDING,
    label: 'Pending',
  },
  {
    value: ORDER_STATUSES.PAID,
    label: 'Confirmed',
  },
  {
    value: ORDER_STATUSES.CANCELLED,
    label: 'Cancelled',
  },
  {
    value: ORDER_STATUSES.PENDING,
    label: 'Not paid',
  },
  {
    value: ORDER_STATUSES.PAID,
    label: 'Paid',
  },
  {
    value: ORDER_STATUSES.REFUNDED,
    label: 'Refunded',
  },
  {
    value: ORDER_STATUSES.PROCESSING,
    label: 'Unfulfilled',
  },
  {
    value: ORDER_STATUSES.PROCESSING,
    label: 'Packed',
  },
  {
    value: ORDER_STATUSES.SHIPPED,
    label: 'Shipped',
  },
  {
    value: ORDER_STATUSES.DELIVERED,
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
