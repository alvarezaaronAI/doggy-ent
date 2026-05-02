const promos = [
  {
    id: 'promo-chase10',
    code: 'CHASE10',
    name: 'Chase 10 Off',
    status: 'active',
    discountType: 'fixed',
    discountValue: 10,
    minimumSubtotal: 0,
    startsAt: null,
    endsAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase()
}

function normalizePromoInput(promoInput) {
  const now = new Date().toISOString()
  const code = normalizePromoCode(promoInput.code)

  return {
    id: promoInput.id || `promo-${code.toLowerCase()}`,
    code,
    name: promoInput.name || code,
    status: promoInput.status || 'draft',
    discountType: promoInput.discountType || 'fixed',
    discountValue: Number(promoInput.discountValue || 0),
    minimumSubtotal: Number(promoInput.minimumSubtotal || 0),
    startsAt: promoInput.startsAt || null,
    endsAt: promoInput.endsAt || null,
    createdAt: promoInput.createdAt || now,
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

  return true
}

function calculateDiscountAmount(promo, subtotal) {
  const safeSubtotal = Number(subtotal || 0)

  if (promo.discountType === 'percent') {
    return Math.min(safeSubtotal, safeSubtotal * (Number(promo.discountValue || 0) / 100))
  }

  return Math.min(safeSubtotal, Number(promo.discountValue || 0))
}

export async function getAllPromos() {
  return promos
}

export async function getPromoById(promoId) {
  return promos.find((promo) => promo.id === promoId) || null
}

export async function createPromo(promoInput) {
  const promo = normalizePromoInput(promoInput)

  const existingPromo = promos.find((p) => p.code === promo.code)
  if (existingPromo) {
    const error = new Error('Promo already exists')
    error.statusCode = 409
    throw error
  }

  promos.push(promo)
  return promo
}

export async function updatePromoById(promoId, promoInput) {
  const index = promos.findIndex((p) => p.id === promoId)
  if (index === -1) throw new Error('Promo not found')

  const updated = normalizePromoInput({
    ...promos[index],
    ...promoInput,
    id: promoId,
  })

  promos[index] = updated
  return updated
}

export async function deletePromoById(promoId) {
  const index = promos.findIndex((p) => p.id === promoId)
  if (index === -1) throw new Error('Promo not found')

  return promos.splice(index, 1)[0]
}

export async function validatePromoCode({ code, cart }) {
  const normalizedCode = normalizePromoCode(code)
  const subtotal = Number(cart?.subtotal || 0)

  const promo = promos.find((p) => p.code === normalizedCode)

  if (!promo) {
    return { valid: false, message: 'Invalid code', discountAmount: 0 }
  }

  if (!isPromoActive(promo)) {
    return { valid: false, message: 'Promo not active', discountAmount: 0 }
  }

  const discountAmount = calculateDiscountAmount(promo, subtotal)

  return {
    valid: true,
    discountAmount,
    message: 'Promo applied',
  }
}