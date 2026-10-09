import { mapAdminCustomerRecord } from './adminCustomerRecord.mapper.js'
import { mapEmailDelivery } from '../../emails/mappers/emailDelivery.mapper.js'

function toNumber(value) {
  return Number(value || 0)
}

function getOrderStats(orders = []) {
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return {
    orderCount: orders.length,
    lifetimeSpend: orders.reduce(
      (total, order) => total + toNumber(order.total),
      0,
    ),
    latestOrderDate: sortedOrders[0]?.createdAt || null,
  }
}

export function mapAdminCustomerListItem(user) {
  const stats = getOrderStats(user.orders || [])

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    orderCount: stats.orderCount,
    lifetimeSpend: stats.lifetimeSpend,
    latestOrderDate: stats.latestOrderDate,
  }
}

export function mapAdminCustomerDetail(user) {
  if (!user) {
    return null
  }

  const listItem = mapAdminCustomerListItem(user)
  const internalRecord = mapAdminCustomerRecord(user)

  return {
    ...listItem,
    internalRecord,
    profile: internalRecord.profile,
    notificationPreference: internalRecord.notificationPreference,
    orders: user.orders || [],
    matchedGuestOrders: user.matchedGuestOrders || [],
    emailDeliveries: (user.emailDeliveries || []).map(mapEmailDelivery).filter(Boolean),
    events: internalRecord.accountEvents,
    supportRequests: internalRecord.supportRequests,
    reviews: internalRecord.reviews,
    loyaltyLedger: internalRecord.loyaltyLedger,
    readiness: {
      deactivateReactivate: true,
      resendVerification: 'Email provider abstraction is ready; delivery provider is not configured.',
      passwordReset: 'Email provider abstraction is ready; delivery provider is not configured.',
      internalNotes: 'CustomerAccountEvent can store future internal account activity.',
      support: 'CustomerSupportRequest model is ready for future support tools.',
      reviews: 'ProductReview model is ready for future review moderation.',
      loyalty: 'LoyaltyLedger model is ready for future points and rewards.',
      referrals: 'Referral models are intentionally deferred.',
    },
  }
}
