import {
  mapCustomerAccountSummary,
  mapCustomerProfile,
} from '../mappers/account.mapper.js'
import {
  findAccountUserById,
  findCustomerOrderForAccount,
  findCustomerOrdersForAccount,
  updateCustomerProfileByUserId,
} from '../repositories/account.repository.js'
import {
  mapCustomerOrder,
} from '../../orders/mappers/orders.mapper.js'

function canIncludeVerifiedEmailMatches(user) {
  return Boolean(user?.emailVerified && user?.email)
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
  const profile = await updateCustomerProfileByUserId(
    user.id,
    {
      firstName: String(input.firstName || '').trim() || null,
      lastName: String(input.lastName || '').trim() || null,
      phone: String(input.phone || '').trim() || null,
      marketingOptIn: Boolean(input.marketingOptIn),
    },
  )

  return {
    ...(await getAccountProfile(user)),
    profile: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      marketingOptIn: Boolean(profile.marketingOptIn),
      defaultAddress: profile.defaultAddress || null,
    },
  }
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
