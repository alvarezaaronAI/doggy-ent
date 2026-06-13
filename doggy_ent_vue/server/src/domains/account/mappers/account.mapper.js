export function mapCustomerProfile(user) {
  if (!user) {
    return null
  }

  const profile = user.profile || {}

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      marketingOptIn: Boolean(profile.marketingOptIn),
      defaultAddress: profile.defaultAddress || null,
    },
    placeholders: {
      tracking: 'Tracking updates will appear here when shipping integration is added.',
      reviews: 'Review requests will appear after delivered orders in a future phase.',
      loyalty: 'Rewards and loyalty history are prepared for a future phase.',
      support: 'Support history is prepared for a future phase.',
    },
  }
}

export function mapCustomerAccountSummary({
  user,
  orders = [],
}) {
  const totalOrders = orders.length
  const lifetimeSpend = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0,
  )

  return {
    profile: mapCustomerProfile(user),
    stats: {
      totalOrders,
      lifetimeSpend,
      latestOrderDate: orders[0]?.createdAt || null,
    },
    recentOrders: orders.slice(0, 3),
  }
}
