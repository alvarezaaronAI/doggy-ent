import {
  ACCOUNT_STATUS,
} from '../../auth/constants/authRoles.constants.js'
import {
  buildAccountVerificationEmail,
  buildPasswordResetEmail,
} from '../../emails/mappers/emailPayloads.mapper.js'
import {
  queueEmail,
} from '../../emails/services/emailProvider.service.js'
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

  const matchedGuestOrders = user.emailVerified
    ? await findGuestOrdersByCustomerEmail(user.email)
    : []

  return mapAdminCustomerDetail({
    ...user,
    matchedGuestOrders,
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

  return queueEmail(
    buildAccountVerificationEmail({
      user: customer,
      url: null,
      event: 'RESEND_VERIFICATION',
    }),
  )
}

export async function queueAdminCustomerPasswordReset(customerId) {
  const customer = await findAdminCustomerById(customerId)

  if (!customer) {
    throwNotFound()
  }

  return queueEmail(
    buildPasswordResetEmail({
      user: customer,
      url: null,
    }),
  )
}
