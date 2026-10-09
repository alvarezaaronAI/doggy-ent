import {
  ACCOUNT_STATUS,
} from '../../auth/constants/authRoles.constants.js'
import {
  customerAuth,
} from '../../auth/services/customerAuth.service.js'
import {
  findRecentEmailDeliveries,
} from '../../emails/repositories/emailDelivery.repository.js'
import {
  mapAdminCustomerDetail,
  mapAdminCustomerListItem,
} from '../mappers/adminCustomers.mapper.js'
import {
  findAdminCustomerById,
  findAdminCustomers,
  findGuestOrdersByCustomerEmail,
  updateCustomerAccountStatus,
} from '../repositories/adminCustomers.repository.js'

function throwNotFound() {
  const error = new Error('Customer not found.')
  error.statusCode = 404
  throw error
}

async function buildCustomerDetail(user) {
  if (!user) {
    return null
  }

  const [matchedGuestOrders, emailDeliveries] = await Promise.all([
    user.emailVerified
      ? findGuestOrdersByCustomerEmail(user.email)
      : [],
    findRecentEmailDeliveries({
      limit: 20,
      userId: user.id,
    }),
  ])

  return mapAdminCustomerDetail({
    ...user,
    matchedGuestOrders,
    emailDeliveries,
  })
}

export async function fetchAdminCustomers() {
  const customers = await findAdminCustomers()

  return customers.map(mapAdminCustomerListItem)
}

export async function fetchAdminCustomerById(customerId) {
  const customer = await findAdminCustomerById(customerId)

  if (!customer) {
    throwNotFound()
  }

  return buildCustomerDetail(customer)
}

export async function deactivateAdminCustomer(customerId) {
  const customer = await updateCustomerAccountStatus({
    customerId,
    status: ACCOUNT_STATUS.DEACTIVATED,
  })

  return buildCustomerDetail(customer)
}

export async function reactivateAdminCustomer(customerId) {
  const customer = await updateCustomerAccountStatus({
    customerId,
    status: ACCOUNT_STATUS.ACTIVE,
  })

  return buildCustomerDetail(customer)
}

export async function queueAdminCustomerVerification(customerId) {
  const customer = await findAdminCustomerById(customerId)

  if (!customer) {
    throwNotFound()
  }

  return customerAuth.api.sendVerificationEmail({
    body: {
      email: customer.email,
      callbackURL: '/account/profile',
    },
  })
}

export async function queueAdminCustomerPasswordReset(customerId) {
  const customer = await findAdminCustomerById(customerId)

  if (!customer) {
    throwNotFound()
  }

  return customerAuth.api.requestPasswordReset({
    body: {
      email: customer.email,
      redirectTo: '/account/reset-password',
    },
  })
}
