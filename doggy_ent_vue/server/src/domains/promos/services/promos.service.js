import {
  getAllPromos as getAllPromosFromRepository,
  getPromoById as getPromoByIdFromRepository,
  getPromoByCode,
  getActivePromoByCode,
  activateScheduledPromos,
  expireEndedPromos,
  createPromo as createPromoInRepository,
  updatePromoById as updatePromoInRepository,
  deletePromoById as deletePromoInRepository,
  createPromoUsageTx,
  incrementPromoUsageStatsTx,
  getPromoUsageCountByCustomer,
  getPromoUsageCount,
  getPromoUsageByOrderIdTx,
  runPromoTransaction,
  getPromoUsageHistory,
  getPromoUsageSummary,
} from '../repositories/promos.repository.js'
import {
  PROMO_DEFAULTS,
  PROMO_DISCOUNT_TYPE,
  PROMO_STATUS,
  PROMO_TYPE,
} from '../constants/promos.constants.js'
import {
  buildPromoMutationData,
  mapPromoAnalytics,
} from '../mappers/promos.mapper.js'
import {
  validatePromoTypeRules,
} from '../validators/promos.validator.js'
import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  normalizeEmail,
  normalizeNullableNumber,
} from '../../../shared/utils/string.js'

const nowISO = () => new Date().toISOString()

async function resolvePromoLifecycleStatuses() {
  const currentDate = new Date()

  try {
    await activateScheduledPromos(currentDate)
    await expireEndedPromos(currentDate)
  }
  catch (error) {
    console.error(
      '[promos] Failed lifecycle status resolution.',
      error,
    )
  }
}

function isUnlimitedUsageLimit(value) {
  return value === null || value === undefined
}

export function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase()
}

export function normalizePromoDiscountValue(promo) {
  const value = Number(promo?.discountValue || 0)

  if (promo?.discountType !== PROMO_DISCOUNT_TYPE.PERCENT) {
    return value
  }

  if (value > 0 && value < 1) {
    return value * 100
  }

  return value
}

function normalizeOptionalDateTime(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error(`${fieldName} must be a valid date and time.`)

    error.statusCode = 400

    throw error
  }

  return parsedDate.toISOString()
}

export function normalizePromoInput(input) {
  const code = normalizePromoCode(input.code)
  const now = nowISO()

  const normalizedType = String(
    input.type || PROMO_DEFAULTS.TYPE,
  ).toUpperCase()

  return {
    id: input.id || `promo-${code.toLowerCase()}`,
    code,
    name: input.name || code,

    type: normalizedType,
    status: String(input.status || PROMO_DEFAULTS.STATUS).toUpperCase(),

    discountType: String(
      input.discountType || PROMO_DEFAULTS.DISCOUNT_TYPE,
    ).toUpperCase(),
    discountValue: Number(input.discountValue ?? 0),

    minimumSubtotal: Number(input.minimumSubtotal ?? 0),

    usageLimitTotal: normalizeNullableNumber(
      input.usageLimitTotal,
    ),

    usageLimitPerCustomer:
      normalizedType === PROMO_TYPE.UNIQUE
        ? Number(
          input.usageLimitPerCustomer
          ?? PROMO_DEFAULTS.UNIQUE_USAGE_LIMIT_PER_CUSTOMER,
        )
        : normalizeNullableNumber(
          input.usageLimitPerCustomer,
        ),
    assignedCustomerEmail: input.assignedCustomerEmail || null,

    referralOwnerName: input.referralOwnerName || null,

    usedCount: Number(input.usedCount ?? 0),
    revenueGenerated: Number(input.revenueGenerated ?? 0),
    discountGiven: Number(input.discountGiven ?? 0),

    startsAt: normalizeOptionalDateTime(input.startsAt, 'startsAt'),
    endsAt: normalizeOptionalDateTime(input.endsAt, 'endsAt'),

    createdAt: input.createdAt || now,
    updatedAt: now,
  }
}

export function hasReachedUsageLimit(promo) {
  if (isUnlimitedUsageLimit(promo.usageLimitTotal)) {
    return false
  }

  return (
    Number(promo.usedCount || 0)
    >= Number(promo.usageLimitTotal)
  )
}

export async function expirePromoIfLimitReached(promo) {
  if (!hasReachedUsageLimit(promo)) {
    return promo
  }

  return updatePromoInRepository(
    promo.id,
    {
      status: PROMO_STATUS.EXPIRED,
    },
  )
}

export function isPromoActive(promo) {
  if (!promo || promo.status !== PROMO_STATUS.ACTIVE) {
    return false
  }

  const now = Date.now()
  const startsAt = promo.startsAt ? Date.parse(promo.startsAt) : null
  const endsAt = promo.endsAt ? Date.parse(promo.endsAt) : null

  if (startsAt && now < startsAt) {
    return false
  }

  if (endsAt && now > endsAt) {
    return false
  }

  if (hasReachedUsageLimit(promo)) {
    return false
  }

  return true
}

export function calculateDiscountAmount(promo, subtotal) {
  const s = normalizeCurrencyAmount(
    subtotal || 0,
  )

  if (promo.discountType === PROMO_DISCOUNT_TYPE.PERCENT) {
    const discountPercent = normalizePromoDiscountValue(promo)

    return normalizeCurrencyAmount(
      Math.min(
        s,
        s * (discountPercent / 100),
      ),
    )
  }

  return normalizeCurrencyAmount(
    Math.min(
      s,
      Number(promo.discountValue || 0),
    ),
  )
}

export async function getAllPromos() {
  await resolvePromoLifecycleStatuses()

  return getAllPromosFromRepository()
}

export async function getPromoById(promoId) {
  return getPromoByIdFromRepository(promoId)
}

export async function getPromoAnalytics(promoId) {
  const promo = await getPromoByIdFromRepository(
    promoId,
  )

  if (!promo) {
    const error = new Error('Promo not found')

    error.statusCode = 404

    throw error
  }

  const [
    usageHistory,
    usageSummary,
  ] = await Promise.all([
    getPromoUsageHistory(promoId),
    getPromoUsageSummary(promoId),
  ])

  return mapPromoAnalytics({
    promo,
    usageHistory,
    usageSummary,
  })
}

export async function createPromo(input) {
  const promo = normalizePromoInput(input)
  validatePromoTypeRules(promo)

  const existingPromo = await getPromoByCode(promo.code)

  if (existingPromo) {
    const error = new Error('Promo already exists')
    error.statusCode = 409
    throw error
  }

  return createPromoInRepository(
    buildPromoMutationData(promo),
  )
}

export async function updatePromoById(promoId, input) {
  const existingPromo = await getPromoByIdFromRepository(promoId)

  if (!existingPromo) {
    const error = new Error('Promo not found')
    error.statusCode = 404
    throw error
  }

  const updatedPromo = normalizePromoInput({
    ...existingPromo,
    ...input,
    id: promoId,
  })
  validatePromoTypeRules(updatedPromo)

  return updatePromoInRepository(
    promoId,
    buildPromoMutationData(updatedPromo),
  )
}

export async function deletePromoById(promoId) {
  return deletePromoInRepository(promoId)
}

export async function validatePromoCode({ code, cart, customerEmail }) {
  const normalizedCode = normalizePromoCode(code)
  const normalizedCustomerEmail = normalizeEmail(customerEmail)
  const subtotal = Number(cart?.subtotal || 0)
  await resolvePromoLifecycleStatuses()

  if (!normalizedCustomerEmail || !normalizedCustomerEmail.includes('@')) {
    return {
      valid: false,
      message: 'Enter your email first so we can check this promo.',
      discountAmount: 0,
    }
  }

  let promo = null

  try {
    promo = await getActivePromoByCode(normalizedCode)

    if (!promo) {
      promo = await getPromoByCode(normalizedCode)
    }
  }
  catch (error) {
    console.error('[promos] Failed DB promo validation lookup.', {
      promoCode: normalizedCode,
      customerEmail: normalizedCustomerEmail,
      error,
    })

    throw error
  }

  if (!promo) {
    return {
      valid: false,
      message: 'Invalid code',
      discountAmount: 0,
    }
  }

  let totalUsageCount = 0
  let customerUsageCount = 0

  try {
    totalUsageCount = await getPromoUsageCount(promo.id)

    customerUsageCount = await getPromoUsageCountByCustomer(
      promo.id,
      normalizedCustomerEmail,
    )
  }
  catch (error) {
    console.error('[promos] Failed promo usage validation lookup.', {
      promoId: promo?.id,
      promoCode: normalizedCode,
      customerEmail: normalizedCustomerEmail,
      error,
    })

    throw error
  }

  if (
    !isUnlimitedUsageLimit(promo.usageLimitTotal)
    && totalUsageCount >= Number(promo.usageLimitTotal)
  ) {
    return {
      valid: false,
      message: 'Promo usage limit reached.',
      discountAmount: 0,
    }
  }

  if (!isPromoActive(promo)) {
    return {
      valid: false,
      message: 'Promo not active.',
      discountAmount: 0,
    }
  }

  if (
    promo.assignedCustomerEmail
    && normalizedCustomerEmail
      !== normalizeEmail(promo.assignedCustomerEmail)
  ) {
    return {
      valid: false,
      message: 'Promo assigned to another customer.',
      discountAmount: 0,
    }
  }

  if (
    !isUnlimitedUsageLimit(promo.usageLimitPerCustomer)
    && customerUsageCount >= Number(promo.usageLimitPerCustomer)
  ) {
    return {
      valid: false,
      message: 'Customer usage limit reached for this promo.',
      discountAmount: 0,
    }
  }

  if (subtotal < Number(promo.minimumSubtotal || 0)) {
    return {
      valid: false,
      message: 'Minimum subtotal not met.',
      discountAmount: 0,
    }
  }

  const discountAmount = calculateDiscountAmount(promo, subtotal)

  return {
    valid: true,
    code: promo.code,
    discountAmount,
    referralOwnerName: promo.referralOwnerName,
    assignedCustomerEmail: promo.assignedCustomerEmail,
    message: `Promo code ${promo.code} applied successfully.`,
  }
}

export async function recordPromoUsage({ code, cart, customerEmail, orderId }) {
  const normalizedCode = normalizePromoCode(code)
  const normalizedCustomerEmail = normalizeEmail(customerEmail)
  const subtotal = normalizeCurrencyAmount(
    cart?.subtotal || 0,
  )
  await resolvePromoLifecycleStatuses()

  if (!normalizedCustomerEmail || !normalizedCustomerEmail.includes('@')) {
    const error = new Error('A customer email is required to record promo usage.')
    error.statusCode = 400
    throw error
  }

  let promo = null

  try {
    promo = await getPromoByCode(normalizedCode)
  }
  catch (error) {
    console.error('[promos] Failed DB promo lookup during redemption.', {
      promoCode: normalizedCode,
      customerEmail: normalizedCustomerEmail,
      orderId,
      error,
    })

    throw error
  }

  if (!promo) {
    return null
  }

  const discountAmount = calculateDiscountAmount(promo, subtotal)

  try {
    await runPromoTransaction(async (tx) => {
      if (orderId) {
        const existingUsage = await getPromoUsageByOrderIdTx(
          tx,
          orderId,
        )

        if (existingUsage) {
          return
        }
      }

      if (!isUnlimitedUsageLimit(promo.usageLimitPerCustomer)) {
        const customerUsageCount = await tx.promoUsage.count({
          where: {
            promoId: promo.id,
            customerEmail: normalizedCustomerEmail,
          },
        })

        if (customerUsageCount >= Number(promo.usageLimitPerCustomer)) {
          throw new Error(
            'Customer usage limit reached for this promo.',
          )
        }
      }

      await createPromoUsageTx(tx, {
        promoId: promo.id,
        orderId: orderId || null,
        customerEmail: normalizedCustomerEmail,
        discountAmount,
        subtotalAmount: subtotal,
      })

      const updatedPromo = await incrementPromoUsageStatsTx(
        tx,
        promo.id,
        subtotal,
        discountAmount,
      )

      if (
        !isUnlimitedUsageLimit(updatedPromo.usageLimitTotal)
        && Number(updatedPromo.usedCount)
          > Number(updatedPromo.usageLimitTotal)
      ) {
        throw new Error(
          'Promo usage limit exceeded during transaction.',
        )
      }

      if (
        !isUnlimitedUsageLimit(updatedPromo.usageLimitTotal)
        && Number(updatedPromo.usedCount)
          >= Number(updatedPromo.usageLimitTotal)
      ) {
        await tx.promo.update({
          where: {
            id: promo.id,
          },
          data: {
          status: PROMO_STATUS.EXPIRED,
          },
        })
      }
    })

    return promo
  }
  catch (error) {
    console.error('[promos] Failed persistent promo usage tracking.', {
      promoId: promo?.id,
      promoCode: normalizedCode,
      customerEmail: normalizedCustomerEmail,
      orderId,
      subtotal,
      discountAmount,
      error,
    })

    throw error
  }
}
