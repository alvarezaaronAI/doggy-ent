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
  fetchCustomerEmailDeliveries,
} from '../../emails/services/emailDelivery.service.js'
import {
  getIssueEligibility,
} from '../../support/services/support.service.js'
import {
  mapOrderIssue,
} from '../../support/mappers/support.mapper.js'

function canIncludeVerifiedEmailMatches(user) {
  return Boolean(user?.emailVerified && user?.email)
}

function normalizeDefaultAddress(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const address = {
    address1: String(value.address1 || '').trim(),
    address2: String(value.address2 || '').trim(),
    city: String(value.city || '').trim(),
    state: String(value.state || '').trim().toUpperCase(),
    zip: String(value.zip || '').trim(),
    country: String(value.country || 'US').trim().toUpperCase(),
  }

  const hasAddress = [
    address.address1,
    address.city,
    address.state,
    address.zip,
  ].some(Boolean)

  return hasAddress ? address : null
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
    openIssueCount: orders.reduce(
      (count, order) =>
        count
        + (order.supportRequests || []).filter((issue) =>
          [
            'OPEN',
            'REVIEWING',
            'WAITING_FOR_CUSTOMER',
            'ACTION_REQUIRED',
          ].includes(issue.status),
        ).length,
      0,
    ),
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
        preferredContactMethod: null,
        defaultAddress: normalizeDefaultAddress(input.defaultAddress),
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
      preferredContactMethod: '',
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
      available: getIssueEligibility(order).eligible,
      eligibility: getIssueEligibility(order),
      issues: Array.isArray(order.supportRequests)
        ? order.supportRequests
            .map((issue) => mapOrderIssue(issue))
            .filter(Boolean)
        : [],
      message: getIssueEligibility(order).eligible
        ? 'Need help with this order? Start an order issue and we will keep the conversation in your account.'
        : getIssueEligibility(order).reason,
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
