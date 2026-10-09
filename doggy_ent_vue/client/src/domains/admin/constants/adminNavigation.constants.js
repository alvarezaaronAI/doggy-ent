export const ADMIN_NAVIGATION = Object.freeze([
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', to: '/admin', icon: 'overview', exact: true },
      { label: 'Orders', to: '/admin/orders', icon: 'orders' },
      { label: 'Shipments', to: '/admin/shipments', icon: 'shipments' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Customers', to: '/admin/customers', icon: 'customers' },
      { label: 'Order issues', to: '/admin/order-issues', icon: 'support' },
    ],
  },
  {
    label: 'Store & marketing',
    items: [
      { label: 'Products', to: '/admin/products', icon: 'products' },
      { label: 'Promos', to: '/admin/promos', icon: 'promos' },
      { label: 'Campaigns', to: '/admin/campaigns', icon: 'campaigns' },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'Notifications',
        to: '/admin/notifications',
        icon: 'notifications',
      },
      { label: 'Reports', to: '/admin/reports', icon: 'reports' },
      {
        label: 'Internal issues',
        to: '/admin/internal-issues',
        icon: 'issues',
      },
    ],
  },
])

export function isAdminNavActive(path, item) {
  return item.exact
    ? path === item.to
    : path === item.to || path.startsWith(`${item.to}/`)
}
