import {
  mapCustomerAccountSummary,
  mapCustomerProfile,
} from '../mappers/account.mapper.js'
import {
  findAccountUserById,
  findCustomerOrderForAccount,
  findCustomerOrdersForAccount,
  updateCustomerNotificationPreferenceByUserId,
  updateCustomerProfileByUserId,
} from '../repositories/account.repository.js'
import {
  mapCustomerOrder,
} from '../../orders/mappers/orders.mapper.js'
import {
  buildProfileUpdatedEmail,
} from '../../emails/mappers/emailPayloads.mapper.js'
import {
  queueEmail,
} from '../../emails/services/emailProvider.service.js'
import {
  fetchCustomerEmailDeliveries,
} from '../../emails/services/emailDelivery.service.js'

function canIncludeVerifiedEmailMatches(user) {
  return Boolean(user?.emailVerified && user?.email)
}

function normalizePreferredContactMethod(value) {
  const normalized = String(value || '').trim().toUpperCase()

  if ([
    'EMAIL',
    'PHONE',
    'TEXT',
  ].includes(normalized)) {
    return normalized
  }

  return null
}

export async function getAccountDashboard(user) {
  const [accountUser, orders] = await Promise.all([
    findAccountUserById(user.id),
    findCustomerOrdersForAccount({
      userId: user.id,
      email: user.email,
      includeVerifiedEmailMatches:
        canIncludeVerifiedEmailMatches(user),
    }),
  ])

  return mapCustomerAccountSummary({
    user: accountUser || user,
    orders: orders.map(mapCustomerOrder),
  })
}

export async function getAccountProfile(user) {
  const accountUser = await findAccountUserById(user.id)

  return mapCustomerProfile(accountUser || user)
}

export async function updateAccountProfile(user, input = {}) {
  const [profile, notificationPreference] = await Promise.all([
    updateCustomerProfileByUserId(
      user.id,
      {
        firstName: String(input.firstName || '').trim() || null,
        lastName: String(input.lastName || '').trim() || null,
        phone: String(input.phone || '').trim() || null,
        marketingOptIn: Boolean(input.marketingOptIn),
        preferredContactMethod: normalizePreferredContactMethod(
          input.preferredContactMethod,
        ),
      },
    ),
    updateCustomerNotificationPreferenceByUserId(
      user.id,
      {
        orderUpdates:
          input.notificationPreference?.orderUpdates !== false,
        trackingUpdates:
          input.notificationPreference?.trackingUpdates !== false,
        reviewRequests:
          input.notificationPreference?.reviewRequests !== false,
        loyaltyNotifications:
          input.notificationPreference?.loyaltyNotifications !== false,
        referralNotifications:
          input.notificationPreference?.referralNotifications !== false,
        marketingEmails: Boolean(
          input.notificationPreference?.marketingEmails,
        ),
      },
    ),
  ])

  const result = {
    ...(await getAccountProfile(user)),
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
  }

  queueEmail(buildProfileUpdatedEmail({
    user,
  })).catch((error) => {
    console.error(
      '[account] Failed to queue profile update email.',
      error?.message || error,
    )
  })

  return result
}

export async function getAccountOrders(user) {
  const orders = await findCustomerOrdersForAccount({
    userId: user.id,
    email: user.email,
    includeVerifiedEmailMatches:
      canIncludeVerifiedEmailMatches(user),
  })

  return orders.map(mapCustomerOrder)
}

export async function getAccountOrderByReference(user, reference) {
  const order = await findCustomerOrderForAccount({
    userId: user.id,
    email: user.email,
    reference,
    includeVerifiedEmailMatches:
      canIncludeVerifiedEmailMatches(user),
  })

  if (!order) {
    const error = new Error('Order not found.')
    error.statusCode = 404
    throw error
  }

  return {
    ...mapCustomerOrder(order),
    support: {
      available: false,
      message: 'Need help with this order? Support requests are prepared for a future phase.',
    },
    tracking: {
      available: false,
      message: 'Tracking is not connected yet.',
    },
    reviews: {
      available: false,
      eligible: order.status === 'DELIVERED',
      message: 'Reviews are planned for delivered orders in a future phase.',
    },
  }
}

export async function getAccountNotifications(user) {
  const [accountUser, deliveries] = await Promise.all([
    findAccountUserById(user.id),
    fetchCustomerEmailDeliveries(user),
  ])

  return {
    notificationPreference:
      mapCustomerProfile(accountUser || user)?.notificationPreference,
    deliveries,
  }
}
