import {
  ORDER_ISSUE_MESSAGE_VISIBILITY,
} from '../constants/support.constants.js'

function normalizeDate(value) {
  return value || null
}

export function mapSupportMessage(message, {
  includeInternal = false,
} = {}) {
  if (!message) {
    return null
  }

  if (
    message.visibility === ORDER_ISSUE_MESSAGE_VISIBILITY.INTERNAL
    && !includeInternal
  ) {
    return null
  }

  return {
    id: message.id,
    authorType: message.authorType,
    body: message.body,
    visibility: message.visibility,
    emailRequested: Boolean(message.emailRequested),
    createdAt: normalizeDate(message.createdAt),
  }
}

export function mapSupportEvent(event) {
  if (!event) {
    return null
  }

  return {
    id: event.id,
    eventType: event.eventType,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    metadata: event.metadata || null,
    actorType: event.actorType,
    createdAt: normalizeDate(event.createdAt),
  }
}

export function mapOrderIssue(issue, {
  includeInternal = false,
} = {}) {
  if (!issue) {
    return null
  }

  return {
    id: includeInternal ? issue.id : undefined,
    caseNumber: issue.caseNumber,
    orderReference: issue.orderReference,
    customerEmail: includeInternal ? issue.customerEmail : undefined,
    customerName: includeInternal ? issue.customerName : undefined,
    category: issue.category,
    priority: issue.priority,
    status: issue.status,
    subject: issue.subject,
    message: issue.message,
    resolutionSummary: issue.resolutionSummary,
    deliveryEligibilityEndsAt:
      normalizeDate(issue.deliveryEligibilityEndsAt),
    resolvedAt: normalizeDate(issue.resolvedAt),
    closedAt: normalizeDate(issue.closedAt),
    createdAt: normalizeDate(issue.createdAt),
    updatedAt: normalizeDate(issue.updatedAt),
    order: issue.order
      ? {
          id: includeInternal ? issue.order.id : undefined,
          orderNumber: issue.order.orderNumber,
          customerReference: issue.order.orderNumber,
          status: issue.order.status,
          createdAt: issue.order.createdAt,
          total: Number(issue.order.total || 0),
        }
      : null,
    messages: Array.isArray(issue.messages)
      ? issue.messages
          .map((message) =>
            mapSupportMessage(message, { includeInternal }),
          )
          .filter(Boolean)
      : [],
    events: Array.isArray(issue.events)
      ? issue.events.map(mapSupportEvent).filter(Boolean)
      : [],
  }
}

export function mapInternalIssue(issue) {
  if (!issue) {
    return null
  }

  return {
    id: issue.id,
    caseNumber: issue.caseNumber,
    fingerprint: issue.fingerprint,
    category: issue.category,
    severity: issue.severity,
    source: issue.source,
    summary: issue.summary,
    safeDetails: issue.safeDetails,
    route: issue.route,
    customerId: issue.customerId,
    orderId: issue.orderId,
    occurrenceCount: Number(issue.occurrenceCount || 0),
    firstSeenAt: normalizeDate(issue.firstSeenAt),
    lastSeenAt: normalizeDate(issue.lastSeenAt),
    status: issue.status,
    reviewNotes: issue.reviewNotes,
    resolutionNotes: issue.resolutionNotes,
    resolvedAt: normalizeDate(issue.resolvedAt),
    createdAt: normalizeDate(issue.createdAt),
    updatedAt: normalizeDate(issue.updatedAt),
    events: Array.isArray(issue.events)
      ? issue.events.map((event) => ({
          id: event.id,
          eventType: event.eventType,
          metadata: event.metadata || null,
          actorType: event.actorType,
          createdAt: normalizeDate(event.createdAt),
        }))
      : [],
  }
}
