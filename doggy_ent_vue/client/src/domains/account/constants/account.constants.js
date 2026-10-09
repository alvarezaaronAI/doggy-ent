export const ACCOUNT_NAV_ITEMS = [
  { label: 'Overview', to: '/account', icon: 'fa-table-cells-large' },
  { label: 'Orders', to: '/account/orders', icon: 'fa-box' },
  { label: 'Profile', to: '/account/profile', icon: 'fa-user' },
  { label: 'Addresses', to: '/account/addresses', icon: 'fa-location-dot' },
  { label: 'Order help', to: '/account/help', icon: 'fa-comment' },
  { label: 'Rewards', to: '/account/rewards', icon: 'fa-gift', future: true },
  { label: 'Wishlist', to: '/account/wishlist', icon: 'fa-heart', future: true },
]

export const ORDER_STATUS_DISPLAY = {
  PENDING: { label: 'Pending', icon: 'fa-clock', tone: 'neutral' },
  PAID: { label: 'Paid', icon: 'fa-circle-check', tone: 'green' },
  PROCESSING: { label: 'Processing', icon: 'fa-box', tone: 'green' },
  SHIPPED: { label: 'Shipped', icon: 'fa-truck', tone: 'blue' },
  DELIVERED: { label: 'Delivered', icon: 'fa-circle-check', tone: 'green' },
  CANCELLED: { label: 'Cancelled', icon: 'fa-circle-xmark', tone: 'neutral' },
  REFUNDED: { label: 'Refunded', icon: 'fa-arrow-rotate-left', tone: 'neutral' },
}

export const ORDER_HISTORY_PAGE_SIZE = 8
export const NOTIFICATION_FIELDS = [
  { key: 'orderUpdates', label: 'Order updates' },
  { key: 'trackingUpdates', label: 'Tracking updates' },
  { key: 'reviewRequests', label: 'Review invitations' },
  { key: 'loyaltyNotifications', label: 'Future rewards updates' },
  { key: 'referralNotifications', label: 'Future referral updates' },
]
