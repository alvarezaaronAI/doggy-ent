import {
  PROMO_STATUSES,
  PROMO_TYPES,
} from '../constants/promo.constants'

function normalizeNullableString(value) {
  if (value === null || value === undefined) {
    return null
  }

  const normalized = String(value).trim()

  return normalized.length
    ? normalized
    : null
}

function normalizeNullableNumber(value) {
  if (
    value === null
    || value === undefined
    || value === ''
  ) {
    return null
  }

  const normalized = Number(value)

  return Number.isNaN(normalized)
    ? null
    : normalized
}

export function normalizePromoForm(form) {
  const normalized = {
    ...form,
  }

  normalized.type = String(
    normalized.type || PROMO_TYPES.GLOBAL,
  ).toUpperCase()

  normalized.status = String(
    normalized.status || PROMO_STATUSES.DRAFT,
  ).toUpperCase()

  normalized.assignedCustomerEmail = (
    normalizeNullableString(
      normalized.assignedCustomerEmail,
    )
  )

  normalized.referralOwnerName = (
    normalizeNullableString(
      normalized.referralOwnerName,
    )
  )

  normalized.usageLimitTotal = (
    normalizeNullableNumber(
      normalized.usageLimitTotal,
    )
  )

  normalized.usageLimitPerCustomer = (
    normalizeNullableNumber(
      normalized.usageLimitPerCustomer,
    )
  )

  if (normalized.type === PROMO_TYPES.GLOBAL) {
    normalized.assignedCustomerEmail = null
    normalized.referralOwnerName = null
  }

  if (normalized.type === PROMO_TYPES.UNIQUE) {
    normalized.usageLimitTotal = 1
    normalized.usageLimitPerCustomer = 1
    normalized.referralOwnerName = null
  }

  if (normalized.type === PROMO_TYPES.REFERRAL) {
    normalized.assignedCustomerEmail = null
  }

  return normalized
}

export function validatePromoForm(form) {
  const errors = []

  if (!form.code?.trim()) {
    errors.push('Promo code is required.')
  }

  if (!form.name?.trim()) {
    errors.push('Promo name is required.')
  }

  if (
    form.type === PROMO_TYPES.UNIQUE
    && !form.assignedCustomerEmail
  ) {
    errors.push(
      'Unique promos require a customer email.',
    )
  }

  if (
    form.type === PROMO_TYPES.REFERRAL
    && !form.referralOwnerName
  ) {
    errors.push(
      'Referral promos require a referral owner.',
    )
  }

  const hasStartDate = (
    form.startsDate
    && form.startsTime
  )

  const hasEndDate = (
    form.endsDate
    && form.endsTime
  )

  if (hasStartDate && hasEndDate) {
    const startsAt = new Date(
      `${form.startsDate}T${form.startsTime}`,
    )

    const endsAt = new Date(
      `${form.endsDate}T${form.endsTime}`,
    )

    if (endsAt <= startsAt) {
      errors.push(
        'Promo end date must be after the start date.',
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
