export function mapCustomerProfile(user) {
  if (!user) {
    return null
  }

  const profile = user.profile || {}
  const notificationPreference =
    user.notificationPreference || {}

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
      preferredContactMethod: profile.preferredContactMethod || '',
      defaultAddress: profile.defaultAddress || null,
    },
    notificationPreference: {
      orderUpdates:
        notificationPreference.orderUpdates !== false,
      trackingUpdates:
        notificationPreference.trackingUpdates !== false,
      reviewRequests:
        notificationPreference.reviewRequests !== false,
      loyaltyNotifications:
        notificationPreference.loyaltyNotifications !== false,
      referralNotifications:
        notificationPreference.referralNotifications !== false,
      marketingEmails: Boolean(
        notificationPreference.marketingEmails,
      ),
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
  openIssueCount = 0,
}) {
  const totalOrders = orders.length

  return {
    profile: mapCustomerProfile(user),
    stats: {
      totalOrders,
      latestOrderDate: orders[0]?.createdAt || null,
      latestOrderStatus: orders[0]?.status || null,
      openIssueCount,
    },
    recentOrders: orders.slice(0, 2),
  }
}
