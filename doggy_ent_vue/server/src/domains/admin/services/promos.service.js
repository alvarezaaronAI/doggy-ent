const nowISO = () => new Date().toISOString()

const promos = [
  {
    id: 'promo-chase10',
    code: 'CHASE10',
    name: 'Chase 10 Off',

    // core
    type: 'global', // global | unique | referral
    status: 'active',

    // discount
    discountType: 'fixed', // fixed | percent
    discountValue: 10,

    // rules
    minimumSubtotal: 0,
    usageLimitTotal: null,
    usageLimitPerCustomer: 1,
    assignedCustomerEmail: null,

    // referral
    referralOwnerName: null,

    // tracking (in‑memory for now)
    usedCount: 0,
    revenueGenerated: 0,
    discountGiven: 0,

    // schedule
    startsAt: null,
    endsAt: null,

    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
]

function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase()
}

function normalizePromoInput(input) {
  const code = normalizePromoCode(input.code)
  const now = nowISO()

  return {
    id: input.id || `promo-${code.toLowerCase()}`,
    code,
    name: input.name || code,

    type: input.type || 'global',
    status: input.status || 'draft',

    discountType: input.discountType || 'fixed',
    discountValue: Number(input.discountValue ?? 0),

    minimumSubtotal: Number(input.minimumSubtotal ?? 0),
    usageLimitTotal: input.usageLimitTotal ?? null,
    usageLimitPerCustomer: input.usageLimitPerCustomer ?? null,
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

function isPromoActive(promo) {
  if (!promo || promo.status !== 'active') return false

  const now = Date.now()
  const startsAt = promo.startsAt ? Date.parse(promo.startsAt) : null
  const endsAt = promo.endsAt ? Date.parse(promo.endsAt) : null

  if (startsAt && now < startsAt) return false
  if (endsAt && now > endsAt) return false

  if (hasReachedUsageLimit(promo)) {
    expirePromoIfLimitReached(promo)
    return false
  }

  return true
}

function calculateDiscountAmount(promo, subtotal) {
  const s = Number(subtotal || 0)

  if (promo.discountType === 'percent') {
    return Math.min(s, s * (Number(promo.discountValue || 0) / 100))
  }

  return Math.min(s, Number(promo.discountValue || 0))
}

function hasReachedUsageLimit(promo) {
  return promo.usageLimitTotal !== null && Number(promo.usedCount || 0) >= Number(promo.usageLimitTotal)
}

function expirePromoIfLimitReached(promo) {
  if (hasReachedUsageLimit(promo)) {
    promo.status = 'expired'
    promo.updatedAt = nowISO()
  }

  return promo
}


export async function getAllPromos() {
  return promos
}

export async function getPromoById(promoId) {
  return promos.find((p) => p.id === promoId) || null
}

export async function createPromo(input) {
  const promo = normalizePromoInput(input)

  if (promos.find((p) => p.code === promo.code)) {
    const e = new Error('Promo already exists')
    e.statusCode = 409
    throw e
  }

  promos.push(promo)
  return promo
}

export async function updatePromoById(promoId, input) {
  const i = promos.findIndex((p) => p.id === promoId)
  if (i === -1) throw new Error('Promo not found')

  const updated = normalizePromoInput({ ...promos[i], ...input, id: promoId })
  promos[i] = updated
  return updated
}

export async function deletePromoById(promoId) {
  const i = promos.findIndex((p) => p.id === promoId)
  if (i === -1) throw new Error('Promo not found')
  return promos.splice(i, 1)[0]
}

export async function validatePromoCode({ code, cart, customerEmail }) {
  const normalizedCode = normalizePromoCode(code)
  const subtotal = Number(cart?.subtotal || 0)

  const promo = promos.find((p) => p.code === normalizedCode)

  if (!promo) {
    return { valid: false, message: 'Invalid code', discountAmount: 0 }
  }

  if (!isPromoActive(promo)) {
    const message = hasReachedUsageLimit(promo)
      ? 'Promo usage limit reached.'
      : 'Promo not active.'

    return { valid: false, message, discountAmount: 0 }
  }


  if (subtotal < Number(promo.minimumSubtotal || 0)) {
    return { valid: false, message: 'Minimum subtotal not met', discountAmount: 0 }
  }

  const discountAmount = calculateDiscountAmount(promo, subtotal)

  return {
    valid: true,
    code: promo.code,
    discountAmount,
    referralOwnerName: promo.referralOwnerName,
    assignedCustomerEmail: promo.assignedCustomerEmail,
    message: promo.assignedCustomerEmail
      ? `Promo code ${promo.code} applied successfully. This is a customer-specific code.`
      : `Promo code ${promo.code} applied successfully.`,
  }
}

export async function recordPromoUsage({ code, cart }) {
  const normalizedCode = normalizePromoCode(code)
  const subtotal = Number(cart?.subtotal || 0)

  const promo = promos.find((p) => p.code === normalizedCode)
  if (!promo) return

  const discountAmount = calculateDiscountAmount(promo, subtotal)

  promo.usedCount += 1
  promo.revenueGenerated += subtotal
  promo.discountGiven += discountAmount
  expirePromoIfLimitReached(promo)

  return promo
}