// Explicit allowlists keep new DB columns from silently appearing in admin responses.
export function pickRecordFields(record, fields) {
  if (!record) return null
  return Object.fromEntries(
    fields.map((field) => [field, record[field] ?? null]),
  )
}

export function mapRecordFields(records, fields) {
  return Array.isArray(records)
    ? records.map((record) => pickRecordFields(record, fields))
    : []
}

export const SUPPORT_RECORD_FIELDS = [
  'id',
  'caseNumber',
  'userId',
  'orderId',
  'orderReference',
  'customerEmail',
  'customerName',
  'category',
  'priority',
  'status',
  'subject',
  'message',
  'resolutionSummary',
  'deliveryEligibilityEndsAt',
  'resolvedAt',
  'closedAt',
  'createdAt',
  'updatedAt',
]

export const EMAIL_RECORD_FIELDS = [
  'id',
  'event',
  'recipient',
  'subject',
  'provider',
  'status',
  'providerId',
  'orderId',
  'userId',
  'errorMessage',
  'sentAt',
  'createdAt',
  'updatedAt',
]
