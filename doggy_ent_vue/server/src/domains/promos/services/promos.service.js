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
  createPromoUsage,
  createPromoUsageTx,
  incrementPromoUsageStats,
  incrementPromoUsageStatsTx,
  getPromoUsageCountByCustomer,
  getPromoUsageCount,
  getPromoUsageByOrderId,
  getPromoUsageByOrderIdTx,
  runPromoTransaction,
  getPromoUsageHistory,
  getPromoUsageSummary,
} from '../repository/promos.repository.js'


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

function normalizeNullableNumber(value) {
  if (
    value === ''
    || value === null
    || value === undefined
  ) {
    return null
  }

  const normalized = Number(value)

  return Number.isNaN(normalized)
    ? null
    : normalized
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}

function isUnlimitedUsageLimit(value) {
  return value === null || value === undefined
}

export function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase()
}

export function normalizePromoInput(input) {
  const code = normalizePromoCode(input.code)
  const now = nowISO()

  const normalizedType = String(
    input.type || 'GLOBAL',
  ).toUpperCase()

  return {
    id: input.id || `promo-${code.toLowerCase()}`,
    code,
    name: input.name || code,

    type: normalizedType,
    status: String(input.status || 'DRAFT').toUpperCase(),

    discountType: String(
      input.discountType || 'FIXED',
    ).toUpperCase(),
    discountValue: Number(input.discountValue ?? 0),

    minimumSubtotal: Number(input.minimumSubtotal ?? 0),

    usageLimitTotal: normalizeNullableNumber(
      input.usageLimitTotal,
    ),

    usageLimitPerCustomer:
      normalizedType === 'UNIQUE'
        ? Number(
          input.usageLimitPerCustomer ?? 1,
        )
        : normalizeNullableNumber(
          input.usageLimitPerCustomer,
        ),
    assignedCustomerEmail: input.assignedCustomerEmail || null,

    referralOwnerName: input.referralOwnerName || null,

    usedCount: Number(input.usedCount ?? 0),
    revenueGenerated: Number(input.revenueGenerated ?? 0),
    discountGiven: Number(input.discountGiven ?? 0),

    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,

    createdAt: input.createdAt || now,
    updatedAt: now,
  }
}

function validatePromoTypeRules(promo) {
  const promoType = String(promo.type || '').toUpperCase()

  if (
    promoType === 'UNIQUE'
    && !promo.assignedCustomerEmail
  ) {
    const error = new Error(
      'Unique promos require assignedCustomerEmail.',
    )

    error.statusCode = 400

    throw error
  }

  if (
    promoType === 'REFERRAL'
    && !promo.referralOwnerName
  ) {
    const error = new Error(
      'Referral promos require referralOwnerName.',
    )

    error.statusCode = 400

    throw error
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
      status: 'EXPIRED',
    },
  )
}

export function isPromoActive(promo) {
  if (!promo || promo.status !== 'ACTIVE') {
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
  const s = Number(subtotal || 0)

  if (promo.discountType === 'PERCENT') {
    return Math.min(
      s,
      s * (Number(promo.discountValue || 0) / 100),
    )
  }

  return Math.min(s, Number(promo.discountValue || 0))
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

  const totalUses = Number(
    usageSummary?._count?.id || 0,
  )

  const totalRevenue = Number(
    usageSummary?._sum?.subtotalAmount || 0,
  )

  const totalDiscountGiven = Number(
    usageSummary?._sum?.discountAmount || 0,
  )

  const averageOrderValue = Number(
    usageSummary?._avg?.subtotalAmount || 0,
  )

  return {
    promo,

    summary: {
      totalUses,
      totalRevenue,
      totalDiscountGiven,
      averageOrderValue,
    },

    usages: usageHistory.map((usage) => ({
      id: usage.id,
      orderId: usage.orderId,
      customerEmail: usage.customerEmail,
      subtotalAmount: Number(
        usage.subtotalAmount || 0,
      ),
      discountAmount: Number(
        usage.discountAmount || 0,
      ),
      createdAt: usage.createdAt,
    })),
  }
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

  return createPromoInRepository({
    code: promo.code,
    name: promo.name,

    type: promo.type,
    status: promo.status,

    discountType: promo.discountType,
    discountValue: promo.discountValue,

    minimumSubtotal: promo.minimumSubtotal,
    usageLimitTotal: promo.usageLimitTotal,
    usageLimitPerCustomer: promo.usageLimitPerCustomer,

    assignedCustomerEmail: promo.assignedCustomerEmail,
    referralOwnerName: promo.referralOwnerName,

    usedCount: promo.usedCount,
    revenueGenerated: promo.revenueGenerated,
    discountGiven: promo.discountGiven,

    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
  })
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

  return updatePromoInRepository(promoId, {
    code: updatedPromo.code,
    name: updatedPromo.name,

    type: updatedPromo.type,
    status: updatedPromo.status,

    discountType: updatedPromo.discountType,
    discountValue: updatedPromo.discountValue,

    minimumSubtotal: updatedPromo.minimumSubtotal,
    usageLimitTotal: updatedPromo.usageLimitTotal,
    usageLimitPerCustomer: updatedPromo.usageLimitPerCustomer,

    assignedCustomerEmail: updatedPromo.assignedCustomerEmail,
    referralOwnerName: updatedPromo.referralOwnerName,

    usedCount: updatedPromo.usedCount,
    revenueGenerated: updatedPromo.revenueGenerated,
    discountGiven: updatedPromo.discountGiven,

    startsAt: updatedPromo.startsAt,
    endsAt: updatedPromo.endsAt,
  })
}

export async function deletePromoById(promoId) {
  return deletePromoInRepository(promoId)
}

export async function validatePromoCode({ code, cart, customerEmail }) {
  const normalizedCode = normalizePromoCode(code)
  const subtotal = Number(cart?.subtotal || 0)
  await resolvePromoLifecycleStatuses()

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
      customerEmail,
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

    if (customerEmail) {
      customerUsageCount = await getPromoUsageCountByCustomer(
        promo.id,
        customerEmail,
      )
    }
  }
  catch (error) {
    console.error('[promos] Failed promo usage validation lookup.', {
      promoId: promo?.id,
      promoCode: normalizedCode,
      customerEmail,
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
    && normalizeEmail(customerEmail)
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
  const subtotal = Number(cart?.subtotal || 0)
  await resolvePromoLifecycleStatuses()

  let promo = null

  try {
    promo = await getPromoByCode(normalizedCode)
  }
  catch (error) {
    console.error('[promos] Failed DB promo lookup during redemption.', {
      promoCode: normalizedCode,
      customerEmail,
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

      await createPromoUsageTx(tx, {
        promoId: promo.id,
        orderId: orderId || null,
        customerEmail: customerEmail || 'guest@example.com',
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
            status: 'EXPIRED',
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
      customerEmail,
      orderId,
      subtotal,
      discountAmount,
      error,
    })

    throw error
  }
}