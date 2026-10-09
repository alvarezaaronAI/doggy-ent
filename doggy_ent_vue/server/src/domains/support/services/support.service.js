import crypto from 'crypto'
import {
  CUSTOMER_DISPUTE_WINDOW_DAYS,
  DELIVERED_ISSUE_CATEGORIES,
  INTERNAL_ISSUE_SEVERITIES,
  INTERNAL_ISSUE_STATUSES,
  ORDER_ISSUE_AUTHOR_TYPES,
  ORDER_ISSUE_CATEGORIES,
  ORDER_ISSUE_MESSAGE_VISIBILITY,
  ORDER_ISSUE_PRIORITIES,
  ORDER_ISSUE_STATUSES,
  PRE_DELIVERY_ISSUE_CATEGORIES,
} from '../constants/support.constants.js'
import {
  addOrderIssueMessage,
  createCustomerOrderIssue,
  findCustomerOrderIssueByCaseNumber,
  findCustomerOrderIssues,
  findOrderIssueByCaseNumber,
  listAdminOrderIssues,
  listInternalIssues,
  updateAdminOrderIssue,
  upsertInternalIssue,
  updateInternalIssue,
} from '../repositories/support.repository.js'
import {
  mapInternalIssue,
  mapOrderIssue,
} from '../mappers/support.mapper.js'
import {
  findCustomerOrderForAccount,
} from '../../account/repositories/account.repository.js'

const MAX_DESCRIPTION_LENGTH = 1200

function createHttpError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeCode(value, fallback) {
  return String(value || fallback)
    .trim()
    .toUpperCase()
    .replaceAll(' ', '_')
}

function normalizeText(value, {
  max = MAX_DESCRIPTION_LENGTH,
} = {}) {
  return String(value || '')
    .trim()
    .slice(0, max)
}

function addDays(value, days) {
  const date = new Date(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

export function getDeliveredAt(order) {
  const shipmentDeliveredAt = Array.isArray(order?.shipments)
    ? order.shipments
        .map((shipment) => shipment.deliveredAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0]
    : null

  if (shipmentDeliveredAt) {
    return shipmentDeliveredAt
  }

  if (order?.status === 'DELIVERED') {
    return order.updatedAt || order.createdAt
  }

  return null
}

export function getIssueEligibility(order, now = new Date()) {
  const deliveredAt = getDeliveredAt(order)

  if (!deliveredAt) {
    return {
      eligible: true,
      deliveredAt: null,
      deadline: null,
      categories: PRE_DELIVERY_ISSUE_CATEGORIES,
      reason:
        'Delivery is not confirmed yet, so only delivery, tracking, billing, and general help categories are available.',
    }
  }

  const deadline = addDays(deliveredAt, CUSTOMER_DISPUTE_WINDOW_DAYS)
  const eligible = now <= deadline

  return {
    eligible,
    deliveredAt,
    deadline,
    categories: eligible
      ? DELIVERED_ISSUE_CATEGORIES
      : [],
    reason: eligible
      ? `Delivered-order issues may be submitted until ${deadline.toISOString()}.`
      : 'The seven-day delivered-order issue window has closed.',
  }
}

function validateCategory(category, allowedCategories) {
  const normalized = normalizeCode(category, 'OTHER')

  if (!ORDER_ISSUE_CATEGORIES.includes(normalized)) {
    throw createHttpError('Choose a valid issue category.')
  }

  if (!allowedCategories.includes(normalized)) {
    throw createHttpError(
      'That issue category is not available for this order status.',
    )
  }

  return normalized
}

function validatePriority(priority) {
  const normalized = normalizeCode(priority, 'NORMAL')

  return ORDER_ISSUE_PRIORITIES.includes(normalized)
    ? normalized
    : 'NORMAL'
}

async function generateUniqueCaseNumber(prefix, finder) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const suffix = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
    const caseNumber = `${prefix}-${suffix.slice(0, 4)}-${suffix.slice(4)}`
    const existing = await finder(caseNumber)

    if (!existing) {
      return caseNumber
    }
  }

  throw createHttpError('Unable to create a case number.', 500)
}

export async function listCustomerOrderIssues(user) {
  const issues = await findCustomerOrderIssues(user.id)

  return issues
    .map((issue) => mapOrderIssue(issue))
    .filter(Boolean)
}

export async function getCustomerOrderIssue(user, caseNumber) {
  const issue = await findCustomerOrderIssueByCaseNumber({
    userId: user.id,
    caseNumber,
  })

  if (!issue) {
    throw createHttpError('Order issue not found.', 404)
  }

  return mapOrderIssue(issue)
}

export async function createOrderIssueForCustomer({
  user,
  reference,
  input = {},
}) {
  const order = await findCustomerOrderForAccount({
    userId: user.id,
    email: user.email,
    reference,
    includeVerifiedEmailMatches: Boolean(
      user.emailVerified && user.email,
    ),
  })

  if (!order) {
    throw createHttpError('Order not found.', 404)
  }

  const eligibility = getIssueEligibility(order)

  if (!eligibility.eligible) {
    throw createHttpError(eligibility.reason)
  }

  const category = validateCategory(
    input.category,
    eligibility.categories,
  )
  const message = normalizeText(input.message)

  if (message.length < 10) {
    throw createHttpError(
      'Tell us a little more so we can review the order issue.',
    )
  }

  const subject = normalizeText(
    input.subject || category.replaceAll('_', ' ').toLowerCase(),
    { max: 120 },
  )
  const caseNumber = await generateUniqueCaseNumber(
    'CE',
    findOrderIssueByCaseNumber,
  )

  const issue = await createCustomerOrderIssue({
    caseNumber,
    user,
    order,
    category,
    priority: validatePriority(input.priority),
    subject,
    message,
    deliveryEligibilityEndsAt: eligibility.deadline,
  })

  return mapOrderIssue(issue)
}

export async function getAdminOrderIssues(filters = {}) {
  const issues = await listAdminOrderIssues({
    search: filters.search,
    status: normalizeCode(filters.status, ''),
    category: normalizeCode(filters.category, ''),
    priority: normalizeCode(filters.priority, ''),
  })

  return {
    issues: issues
      .map((issue) =>
        mapOrderIssue(issue, { includeInternal: true }),
      )
      .filter(Boolean),
    counts: {
      open: issues.filter((issue) => issue.status === 'OPEN').length,
      actionRequired: issues.filter(
        (issue) => issue.status === 'ACTION_REQUIRED',
      ).length,
      total: issues.length,
    },
  }
}

export async function updateOrderIssueAsAdmin(caseNumber, input = {}) {
  const nextStatus = normalizeCode(input.status, '')
  const nextPriority = normalizeCode(input.priority, '')
  const data = {}
  const eventMetadata = {}

  if (nextStatus) {
    if (!ORDER_ISSUE_STATUSES.includes(nextStatus)) {
      throw createHttpError('Choose a valid issue status.')
    }

    data.status = nextStatus
    eventMetadata.status = nextStatus

    if (nextStatus === 'RESOLVED') {
      data.resolvedAt = new Date()
      data.resolutionSummary =
        normalizeText(input.resolutionSummary, { max: 600 })
        || null
    }

    if (nextStatus === 'CLOSED') {
      data.closedAt = new Date()
    }
  }

  if (nextPriority) {
    if (!ORDER_ISSUE_PRIORITIES.includes(nextPriority)) {
      throw createHttpError('Choose a valid issue priority.')
    }

    data.priority = nextPriority
    eventMetadata.priority = nextPriority
  }

  if ('resolutionSummary' in input && !data.resolutionSummary) {
    data.resolutionSummary =
      normalizeText(input.resolutionSummary, { max: 600 }) || null
  }

  const issue = await updateAdminOrderIssue({
    caseNumber,
    data,
    event: Object.keys(data).length
      ? {
          eventType: 'ADMIN_UPDATED',
          toStatus: data.status,
          actorType: ORDER_ISSUE_AUTHOR_TYPES.ADMIN_ENV,
          actorId: 'ADMIN_ENV',
          metadata: eventMetadata,
        }
      : null,
  })

  if (!issue) {
    throw createHttpError('Order issue not found.', 404)
  }

  return mapOrderIssue(issue, { includeInternal: true })
}

export async function addAdminOrderIssueMessage(caseNumber, input = {}) {
  const body = normalizeText(input.body)

  if (body.length < 2) {
    throw createHttpError('Message cannot be empty.')
  }

  const visibility =
    normalizeCode(input.visibility, 'INTERNAL') === 'CUSTOMER'
      ? ORDER_ISSUE_MESSAGE_VISIBILITY.CUSTOMER
      : ORDER_ISSUE_MESSAGE_VISIBILITY.INTERNAL

  const issue = await addOrderIssueMessage({
    caseNumber,
    body,
    visibility,
    authorType: ORDER_ISSUE_AUTHOR_TYPES.ADMIN_ENV,
    authorUserId: 'ADMIN_ENV',
    emailRequested: Boolean(input.emailRequested),
  })

  if (!issue) {
    throw createHttpError('Order issue not found.', 404)
  }

  return mapOrderIssue(issue, { includeInternal: true })
}

export async function getInternalIssues(filters = {}) {
  const issues = await listInternalIssues({
    search: filters.search,
    status: normalizeCode(filters.status, ''),
    category: normalizeText(filters.category, { max: 80 }),
    severity: normalizeCode(filters.severity, ''),
  })

  return {
    issues: issues.map(mapInternalIssue).filter(Boolean),
    counts: {
      total: issues.length,
      open: issues.filter((issue) =>
        [
          'NEW',
          'REVIEWING',
          'IN_PROGRESS',
          'MONITORING',
        ].includes(issue.status),
      ).length,
      severe: issues.filter((issue) => issue.severity === 'SEVERE').length,
    },
  }
}

export async function updateInternalIssueAsAdmin(caseNumber, input = {}) {
  const status = normalizeCode(input.status, '')
  const severity = normalizeCode(input.severity, '')
  const data = {}

  if (status) {
    if (!INTERNAL_ISSUE_STATUSES.includes(status)) {
      throw createHttpError('Choose a valid internal issue status.')
    }

    data.status = status

    if ([
      'RESOLVED',
      'CLOSED',
    ].includes(status)) {
      data.resolvedAt = new Date()
    }
  }

  if (severity) {
    if (!INTERNAL_ISSUE_SEVERITIES.includes(severity)) {
      throw createHttpError('Choose a valid internal issue severity.')
    }

    data.severity = severity
  }

  if ('reviewNotes' in input) {
    data.reviewNotes =
      normalizeText(input.reviewNotes, { max: 1200 }) || null
  }

  if ('resolutionNotes' in input) {
    data.resolutionNotes =
      normalizeText(input.resolutionNotes, { max: 1200 }) || null
  }

  const issue = await updateInternalIssue({
    caseNumber,
    data,
    event: Object.keys(data).length
      ? {
          eventType: 'ADMIN_UPDATED',
          actorType: ORDER_ISSUE_AUTHOR_TYPES.ADMIN_ENV,
          actorId: 'ADMIN_ENV',
          metadata: data,
        }
      : null,
  })

  if (!issue) {
    throw createHttpError('Internal issue not found.', 404)
  }

  return mapInternalIssue(issue)
}

export async function recordInternalIssue({
  category = 'SERVER',
  severity = 'HIGH',
  source = 'error-middleware',
  summary = 'Unexpected server error',
  safeDetails = '',
  route = '',
  customerId = null,
  orderId = null,
} = {}) {
  const normalizedSummary =
    normalizeText(summary, { max: 180 })
    || 'Unexpected server error'
  const normalizedRoute = normalizeText(route, { max: 180 })
  const fingerprint = crypto
    .createHash('sha256')
    .update([
      category,
      source,
      normalizedSummary,
      normalizedRoute,
    ].join('|'))
    .digest('hex')
    .slice(0, 32)

  const caseNumber = await generateUniqueCaseNumber(
    'INT',
    async (value) => {
      const issues = await listInternalIssues({ search: value })
      return issues.find((issue) => issue.caseNumber === value)
    },
  )

  return upsertInternalIssue({
    caseNumber,
    fingerprint,
    category: normalizeText(category, { max: 80 }) || 'SERVER',
    severity: INTERNAL_ISSUE_SEVERITIES.includes(severity)
      ? severity
      : 'HIGH',
    source: normalizeText(source, { max: 120 }) || 'error-middleware',
    summary: normalizedSummary,
    safeDetails: normalizeText(safeDetails, { max: 600 }) || null,
    route: normalizedRoute || null,
    customerId,
    orderId,
  })
}
