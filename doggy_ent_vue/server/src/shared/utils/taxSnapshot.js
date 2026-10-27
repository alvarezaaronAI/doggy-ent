import { US_STATES } from './usAddress.js'

export const MAX_TAX_SNAPSHOT_BYTES = 3500
export const MAX_TAX_BREAKDOWN_ROWS = 12
const MAX_CENTS = 99999999
const STATUSES = ['not_configured', 'pending_address', 'calculated', 'not_collecting']
const REASONS = ['customer_exempt', 'not_collecting', 'not_subject_to_tax', 'not_supported', 'portion_product_exempt', 'portion_reduced_rated', 'portion_standard_rated', 'product_exempt', 'product_exempt_holiday', 'proportionally_rated', 'reduced_rated', 'reverse_charge', 'standard_rated', 'taxable_basis_reduced', 'zero_rated']
const invalid = () => Object.assign(new Error('Tax details could not be verified. Review checkout again.'), { statusCode: 400, code: 'INVALID_TAX_SNAPSHOT' })
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const check = condition => { if (!condition) throw invalid() }

function amount(value) {
  check(typeof value === 'number' && Number.isFinite(value) && value >= 0)
  const cents = Math.round(value * 100)
  check(Number.isSafeInteger(cents) && cents <= MAX_CENTS && Math.abs(value * 100 - cents) < 0.000001)
  return cents / 100
}

function safeText(value, maxLength) {
  check(typeof value === 'string' && value.length > 0 && value.length <= maxLength && value === value.trim() && !/[\u0000-\u001f\u007f<>]/.test(value))
  return value
}

function rate(value) {
  if (value === null) return null
  check(typeof value === 'string' && /^(?:0|[1-9]\d{0,2})(?:\.\d{1,6})?$/.test(value) && Number(value) <= 100)
  return value
}

function publicDetails(value) {
  check(record(value) && ['none', 'stripe'].includes(value.provider) && STATUSES.includes(value.status))
  check(record(value.location) && value.location.country === 'US')
  const location = { country: 'US' }
  if (value.location.state !== undefined) {
    check(US_STATES.includes(value.location.state))
    location.state = value.location.state
  }
  if (value.location.city !== undefined) location.city = safeText(value.location.city, 80)
  check(Array.isArray(value.breakdown) && value.breakdown.length <= MAX_TAX_BREAKDOWN_ROWS)
  const breakdown = value.breakdown.map(row => {
    check(record(row) && REASONS.includes(row.taxabilityReason))
    return { label: safeText(row.label, 80), ratePercent: rate(row.ratePercent), taxAmount: amount(row.taxAmount), taxableAmount: amount(row.taxableAmount), taxabilityReason: row.taxabilityReason }
  })
  const result = { provider: value.provider, status: value.status, taxAmount: amount(value.taxAmount), ratePercent: rate(value.ratePercent), location, breakdown, calculatedAt: value.calculatedAt }
  check(typeof result.calculatedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result.calculatedAt))
  check(Number.isFinite(Date.parse(result.calculatedAt)) && new Date(result.calculatedAt).toISOString() === result.calculatedAt)
  check(Math.round(breakdown.reduce((sum, row) => sum + Math.round(row.taxAmount * 100), 0)) === Math.round(result.taxAmount * 100))
  if (['not_configured', 'pending_address'].includes(result.status)) {
    check(result.taxAmount === 0 && result.ratePercent === null && breakdown.length === 0)
  }
  if (result.provider === 'none') check(result.status === 'not_configured')
  if (['calculated', 'not_collecting'].includes(result.status)) check(result.provider === 'stripe' && breakdown.length > 0)
  if (result.status === 'not_collecting') check(result.taxAmount === 0 && result.ratePercent === null && breakdown.some(row => row.taxabilityReason === 'not_collecting'))
  if (result.ratePercent !== null) {
    check(breakdown.length > 0 && breakdown.every(row => row.ratePercent !== null && row.taxabilityReason !== 'not_collecting' && row.taxableAmount === breakdown[0].taxableAmount))
    const scaled = value => Math.round(Number(value) * 1000000)
    check(scaled(result.ratePercent) === breakdown.reduce((sum, row) => sum + scaled(row.ratePercent), 0))
  }
  return result
}

function assertSize(value) {
  try { check(Buffer.byteLength(JSON.stringify(value), 'utf8') <= MAX_TAX_SNAPSHOT_BYTES) } catch { throw invalid() }
}

export function validateTaxSnapshot(snapshot) {
  assertSize(snapshot)
  check(record(snapshot) && snapshot.version === 1)
  const result = { version: 1, ...publicDetails(snapshot) }
  if (result.provider === 'stripe' && ['calculated', 'not_collecting'].includes(result.status)) {
    check(snapshot.calculationId !== undefined && snapshot.mode !== undefined)
  }
  if (snapshot.calculationId !== undefined) {
    check(result.provider === 'stripe' && ['calculated', 'not_collecting'].includes(result.status))
    check(typeof snapshot.calculationId === 'string' && /^taxcalc_[A-Za-z0-9]{1,128}$/.test(snapshot.calculationId))
    result.calculationId = snapshot.calculationId
  }
  if (snapshot.mode !== undefined) {
    check(result.provider === 'stripe' && ['sandbox', 'live'].includes(snapshot.mode))
    result.mode = snapshot.mode
  }
  assertSize(result)
  return result
}

// Repeated order/customer mapping is safe: public details need no internal version or ID.
export function mapPublicTaxDetails(snapshot, expectedAmount) {
  if (snapshot == null) return null
  try {
    assertSize(snapshot)
    const details = snapshot.version === undefined ? publicDetails(snapshot) : publicDetails(validateTaxSnapshot(snapshot))
    if (expectedAmount !== undefined && amount(expectedAmount) !== details.taxAmount) return null
    assertSize(details)
    return details
  } catch { return null }
}
