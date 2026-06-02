import {
  DISCOUNT_TYPES,
  PROMO_TYPES,
} from '@promos/constants/promo.constants'
import {
  normalizePromoForm,
} from '@promos/utils/promo.rules'
import {
  DEFAULT_PROMO_STATUS,
  DEFAULT_PROMO_TYPE,
} from '../constants/adminPromos.constants'

export function createEmptyAdminPromoForm() {
  return {
    code: '',
    name: '',
    type: DEFAULT_PROMO_TYPE,
    status: DEFAULT_PROMO_STATUS,
    discountType: DISCOUNT_TYPES.FIXED,
    discountValue: 0,
    minimumSubtotal: 0,
    usageLimitTotal: '',
    usageLimitPerCustomer: 1,
    assignedCustomerEmail: '',
    referralOwnerName: '',
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
  }
}

export function normalizeOptionalString(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function normalizeOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

function splitDateTime(value) {
  if (!value) {
    return { date: '', time: '' }
  }

  const [date = '', timeWithSeconds = ''] = String(value).split('T')
  const time = timeWithSeconds.slice(0, 5)

  return { date, time }
}

function combineDateTime(date, time) {
  if (!date) return null
  return `${date}T${time || '00:00'}`
}

export function buildAdminPromoPayload(form) {
  return normalizePromoForm({
    code: form.code,
    name: form.name,
    type: form.type,
    status: form.status,
    discountType: form.discountType,
    discountValue: Number(form.discountValue || 0),
    minimumSubtotal: Number(form.minimumSubtotal || 0),
    usageLimitTotal: normalizeOptionalNumber(
      form.usageLimitTotal,
    ),
    usageLimitPerCustomer: normalizeOptionalNumber(
      form.usageLimitPerCustomer,
    ),
    assignedCustomerEmail: normalizeOptionalString(
      form.assignedCustomerEmail,
    ),
    referralOwnerName: normalizeOptionalString(
      form.referralOwnerName,
    ),
    startsDate: form.startsDate,
    startsTime: form.startsTime,
    endsDate: form.endsDate,
    endsTime: form.endsTime,
    startsAt: combineDateTime(
      form.startsDate,
      form.startsTime,
    ),
    endsAt: combineDateTime(
      form.endsDate,
      form.endsTime,
    ),
  })
}

export function mapPromoToAdminPromoForm(promo) {
  const starts = splitDateTime(promo.startsAt)
  const ends = splitDateTime(promo.endsAt)

  return {
    code: promo.code || '',
    name: promo.name || '',
    type: promo.type || PROMO_TYPES.GLOBAL,
    status: promo.status || DEFAULT_PROMO_STATUS,
    discountType: promo.discountType || DISCOUNT_TYPES.FIXED,
    discountValue: Number(promo.discountValue || 0),
    minimumSubtotal: Number(promo.minimumSubtotal || 0),
    usageLimitTotal: promo.usageLimitTotal ?? '',
    usageLimitPerCustomer: promo.usageLimitPerCustomer ?? '',
    assignedCustomerEmail: promo.assignedCustomerEmail || '',
    referralOwnerName: promo.referralOwnerName || '',
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  }
}
