const statuses = new Set(['not_configured', 'pending_address', 'calculated', 'not_collecting'])
const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
const text = value => typeof value === 'string' ? value.trim() : ''

export function formatTaxRate(value) {
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value.trim())) return null
  const rate = Number(value)
  return rate <= 100 ? `${rate}%` : null
}

export function mapTaxDetails(value) {
  if (!value || !['none', 'stripe'].includes(value.provider) || !statuses.has(value.status)
    || !amount(value.taxAmount) || value.location?.country !== 'US') return null

  return {
    provider: value.provider,
    status: value.status,
    taxAmount: value.taxAmount,
    rate: formatTaxRate(value.ratePercent),
    destination: [text(value.location.city), text(value.location.state), 'United States'].filter(Boolean).join(', '),
    breakdown: (Array.isArray(value.breakdown) ? value.breakdown : []).flatMap(row => {
      if (!row || !text(row.label) || !amount(row.taxAmount) || !amount(row.taxableAmount)) return []
      return [{
        label: text(row.label),
        rate: formatTaxRate(row.ratePercent),
        taxAmount: row.taxAmount,
        taxableAmount: row.taxableAmount,
        reason: taxabilityMessage(row.taxabilityReason),
      }]
    }),
  }
}

function taxabilityMessage(reason) {
  const reasons = {
    not_collecting: 'Tax not collected in this jurisdiction.',
    not_subject_to_tax: 'Not subject to tax.',
    zero_rated: 'Zero-rated items.',
    product_exempt: 'Product exemption applied.',
    customer_exempt: 'Customer exemption applied.',
    exempt: 'Exemption applied.',
    not_supported: 'Tax calculation not supported for these items.',
  }
  return Object.hasOwn(reasons, reason) ? reasons[reason] : ''
}

export function isUsableCheckoutPricing(pricing) {
  if (!pricing || !['subtotal', 'discountAmount', 'shippingAmount', 'total'].every(key => amount(pricing[key]))
    || !amount(pricing.taxAmount ?? pricing.tax)) return false
  if (pricing.taxDetails == null) return true
  const details = mapTaxDetails(pricing.taxDetails)
  if (!details || details.taxAmount !== (pricing.taxAmount ?? pricing.tax)) return false
  return !['not_configured', 'pending_address', 'not_collecting'].includes(details.status) || details.taxAmount === 0
}
