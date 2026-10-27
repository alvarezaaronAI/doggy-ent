import { createHash } from 'node:crypto'
import { getVerifiedStripeContext } from '../../domains/payments/services/paymentEnvironment.service.js'
import { assertUsDestination, US_STATES } from '../utils/usAddress.js'
import { MAX_TAX_BREAKDOWN_ROWS, validateTaxSnapshot } from '../utils/taxSnapshot.js'

const MAX_CENTS = 99999999
const MAX_CACHE_SIZE = 100
const taxUnavailable = () => Object.assign(new Error('Tax calculation is temporarily unavailable. Please try again.'), { statusCode: 503, code: 'TAX_UNAVAILABLE' })
const requireValid = condition => { if (!condition) throw taxUnavailable() }
const blocker = (code, message) => ({ code, message })
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')

export function getTaxConfig(env = process.env) {
  return { provider: env.TAX_PROVIDER || 'none', productCode: env.STRIPE_TAX_PRODUCT_CODE || '', liveEnabled: env.STRIPE_TAX_LIVE_ENABLED === 'true' }
}

function normalizeConfig(value) {
  const source = value || {}
  const config = Object.keys(source).some(key => key.startsWith('TAX_') || key.startsWith('STRIPE_')) ? getTaxConfig(source) : source
  return { provider: config.provider || 'none', productCode: config.productCode || '', liveEnabled: config.liveEnabled === true }
}

function cents(value) {
  requireValid(typeof value === 'number' && Number.isFinite(value) && value >= 0)
  const result = Math.round(value * 100)
  requireValid(Number.isSafeInteger(result) && result <= MAX_CENTS && Math.abs(value * 100 - result) < 0.000001)
  return result
}

function integer(value) {
  requireValid(Number.isSafeInteger(value) && value >= 0 && value <= MAX_CENTS)
  return value
}

function freezeSnapshot(value) {
  const snapshot = validateTaxSnapshot(value)
  snapshot.breakdown.forEach(Object.freeze)
  Object.freeze(snapshot.breakdown)
  Object.freeze(snapshot.location)
  return Object.freeze(snapshot)
}

function prepareCart({ cartItems, subtotal, discountAmount = 0, shippingAmount = 0 }) {
  requireValid(Array.isArray(cartItems) && cartItems.length > 0 && cartItems.length <= 100)
  const total = cents(subtotal), discount = cents(discountAmount), shipping = cents(shippingAmount)
  requireValid(discount <= total)
  const lines = cartItems.map((item, index) => {
    requireValid(Number.isSafeInteger(item?.quantity) && item.quantity > 0 && item.quantity <= 999)
    return { amount: integer(cents(item.price) * item.quantity), quantity: item.quantity, reference: `line_${index + 1}` }
  })
  requireValid(lines.reduce((sum, line) => sum + line.amount, 0) === total && total > 0)
  // Largest remainder allocates every discount cent once, with stable cart-order ties.
  const shares = lines.map((line, index) => {
    const weighted = BigInt(discount) * BigInt(line.amount)
    return { index, amount: Number(weighted / BigInt(total)), remainder: weighted % BigInt(total) }
  })
  let remaining = discount - shares.reduce((sum, share) => sum + share.amount, 0)
  const ranked = [...shares].sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1)
  for (const share of ranked) { if (remaining-- <= 0) break; share.amount += 1 }
  lines.forEach((line, index) => { line.amount -= shares[index].amount })
  const net = integer(total - discount + shipping)
  const identity = cartItems.map((item, index) => [item.productId ?? item.id ?? null, item.sku ?? item.variant?.sku ?? null, item.size ?? null, cents(item.price), lines[index].quantity])
  return { lines, net, shipping, identity, total, discount }
}

function percentage(details) {
  const value = details?.percentage_decimal
  if (details?.rate_type === 'flat_amount' || details?.flat_amount != null) return null
  requireValid(value == null || typeof value === 'string' && /^(?:0|[1-9]\d{0,2})(?:\.\d{1,6})?$/.test(value) && Number(value) <= 100)
  return value == null ? null : String(Number(value))
}

function labelFor(row) {
  const jurisdiction = row?.jurisdiction
  requireValid(jurisdiction?.country === 'US' && ['country', 'state', 'county', 'city', 'district'].includes(jurisdiction.level))
  requireValid(jurisdiction.state == null || US_STATES.includes(jurisdiction.state))
  requireValid(typeof jurisdiction.display_name === 'string' && jurisdiction.display_name.length > 0 && jurisdiction.display_name.length <= 60 && !/[\u0000-\u001f\u007f<>]/.test(jurisdiction.display_name))
  return `${jurisdiction.display_name.trim()} ${jurisdiction.level} tax`
}

function calculationSnapshot(calculation, { context, cart, address, productCode, calculatedAt }) {
  requireValid(/^taxcalc_[A-Za-z0-9]{1,128}$/.test(calculation?.id || '') && calculation.currency === 'usd' && calculation.livemode === (context.mode === 'live'))
  const exclusive = integer(calculation.tax_amount_exclusive)
  requireValid(calculation.tax_amount_inclusive === 0 && integer(calculation.amount_total) === cart.net + exclusive)
  const summary = calculation.tax_breakdown
  requireValid(Array.isArray(summary) && summary.length > 0 && summary.length <= 20)
  requireValid(summary.every(row => row.inclusive === false && integer(row.amount) >= 0 && integer(row.taxable_amount) <= cart.net && row.tax_rate_details?.country === 'US'))
  requireValid(summary.reduce((sum, row) => sum + row.amount, 0) === exclusive)
  requireValid(calculation.line_items?.has_more === false && Array.isArray(calculation.line_items.data) && calculation.line_items.data.length === cart.lines.length)

  const groups = new Map(), seen = new Set()
  let rowCount = 0, lineTax = 0
  function collect(rows, expectedTax, base) {
    requireValid(Array.isArray(rows) && rows.length > 0 && rows.length <= 20)
    rowCount += rows.length
    requireValid(rowCount <= 2000)
    requireValid(rows.reduce((sum, row) => sum + integer(row.amount), 0) === expectedTax)
    for (const row of rows) {
      const label = labelFor(row), ratePercent = percentage(row.tax_rate_details)
      const taxable = integer(row.taxable_amount)
      requireValid(taxable <= base)
      const key = JSON.stringify([row.jurisdiction, ratePercent, row.tax_rate_details?.tax_type, row.taxability_reason])
      const group = groups.get(key) || { label, ratePercent, taxAmount: 0, taxableAmount: 0, taxabilityReason: row.taxability_reason }
      group.taxAmount += row.amount
      group.taxableAmount += taxable
      groups.set(key, group)
      requireValid(groups.size <= MAX_TAX_BREAKDOWN_ROWS)
    }
  }
  for (const line of calculation.line_items.data) {
    const expected = cart.lines.find(item => item.reference === line.reference)
    requireValid(expected && !seen.has(line.reference) && line.amount === expected.amount && line.quantity === expected.quantity && line.tax_behavior === 'exclusive' && line.tax_code === productCode && line.livemode === (context.mode === 'live'))
    seen.add(line.reference)
    lineTax += integer(line.amount_tax)
    collect(line.tax_breakdown, line.amount_tax, line.amount)
  }
  const shipping = calculation.shipping_cost
  if (shipping != null) {
    requireValid(shipping.amount === cart.shipping && shipping.tax_behavior === 'exclusive')
    lineTax += integer(shipping.amount_tax)
    if (cart.shipping || shipping.amount_tax || shipping.tax_breakdown?.length) collect(shipping.tax_breakdown, shipping.amount_tax, shipping.amount)
  } else requireValid(cart.shipping === 0)
  requireValid(lineTax === exclusive)
  const breakdown = [...groups.values()].map(row => ({ ...row, taxAmount: integer(row.taxAmount) / 100, taxableAmount: integer(row.taxableAmount) / 100 }))
  const notCollecting = exclusive === 0 && breakdown.some(row => row.taxabilityReason === 'not_collecting')
  const summaryPercentages = summary.map(row => percentage(row.tax_rate_details))
  const sameBase = summary.every(row => row.taxable_amount === summary[0].taxable_amount && row.tax_rate_details.rate_type === 'percentage' && row.taxability_reason !== 'not_collecting')
    && breakdown.every(row => row.taxableAmount === breakdown[0].taxableAmount && row.ratePercent !== null && row.taxabilityReason !== 'not_collecting')
  const sumRates = rates => rates.reduce((sum, value) => sum + Math.round(Number(value) * 1000000), 0)
  const ratePercent = !notCollecting && sameBase && summaryPercentages.every(value => value !== null) && sumRates(summaryPercentages) === sumRates(breakdown.map(row => row.ratePercent))
    ? String(sumRates(summaryPercentages) / 1000000) : null
  return freezeSnapshot({ version: 1, provider: 'stripe', status: notCollecting ? 'not_collecting' : 'calculated', taxAmount: exclusive / 100, ratePercent,
    location: { country: 'US', state: address.state, city: address.city }, breakdown, calculatedAt, calculationId: calculation.id, mode: context.mode })
}

export function createTaxService({ getContext = getVerifiedStripeContext, config = getTaxConfig, clock = Date.now } = {}) {
  const readinessCache = new Map(), calculationCache = new Map(), clientIds = new WeakMap()
  let nextClientId = 0
  const readConfig = () => normalizeConfig(typeof config === 'function' ? config() : config)
  const timestamp = () => new Date(clock()).toISOString()

  async function cached(map, key, work, ttl) {
    const previous = map.get(key)
    if (previous && (previous.pending || previous.expiresAt > clock())) return previous.pending || previous.value
    map.delete(key)
    while (map.size >= MAX_CACHE_SIZE) map.delete(map.keys().next().value)
    const entry = {}
    const pending = Promise.resolve().then(work).then(value => {
      if (map.get(key) === entry) {
        entry.value = value
        entry.expiresAt = clock() + ttl(value)
        delete entry.pending
      }
      return value
    }).catch(error => { if (map.get(key) === entry) map.delete(key); throw error })
    entry.pending = pending
    map.set(key, entry)
    return pending
  }

  function baseReadiness(settings) {
    const disabled = ['none', 'disabled', ''].includes(settings.provider)
    const validProvider = settings.provider === 'stripe'
    const productCodeConfigured = typeof settings.productCode === 'string' && /^txcd_\d{8}$/.test(settings.productCode)
    const blockers = []
    if (!disabled && !validProvider) blockers.push(blocker('UNSUPPORTED_PROVIDER', 'Configure Stripe Tax or explicitly disable tax collection. Local tax estimates are not supported.'))
    if (validProvider && !productCodeConfigured) blockers.push(blocker('PRODUCT_CODE_REQUIRED', 'Configure the owner-approved Stripe product tax code.'))
    return { provider: validProvider ? 'stripe' : 'none', mode: 'unconfigured', status: disabled ? 'disabled' : 'not_configured', headOfficeConfigured: false, productCodeConfigured, activeRegistrationStates: [], checkedAt: null, blockers }
  }

  function contextKey(context, settings) {
    requireValid(context?.stripe && typeof context.stripe === 'object' && /^acct_[A-Za-z0-9]{1,128}$/.test(context.accountId || '') && ['sandbox', 'live'].includes(context.mode))
    if (!clientIds.has(context.stripe)) clientIds.set(context.stripe, ++nextClientId)
    return hash([clientIds.get(context.stripe), context.accountId, context.mode, settings])
  }

  async function readiness(settings) {
    const base = baseReadiness(settings)
    if (base.provider !== 'stripe' || !base.productCodeConfigured) return { result: base }
    let context, key
    try { context = await getContext(); key = contextKey(context, settings) } catch {
      return { result: { ...base, status: 'unavailable', checkedAt: timestamp(), blockers: [blocker('ACCOUNT_UNVERIFIED', 'The intended Stripe account could not be verified.')] } }
    }
    const result = await cached(readinessCache, key, async () => {
      const result = { ...base, mode: context.mode, checkedAt: timestamp(), blockers: [] }
      if (context.mode === 'live' && !settings.liveEnabled) {
        return { ...result, status: 'not_configured', blockers: [blocker('LIVE_TAX_DISABLED', 'Live tax calls require explicit server approval.')] }
      }
      try {
        const taxSettings = await context.stripe.tax.settings.retrieve()
        requireValid(taxSettings?.livemode === (context.mode === 'live'))
        try { assertUsDestination(taxSettings.head_office?.address, { allowIncomplete: false }); result.headOfficeConfigured = true } catch { /* Only the readiness Boolean is exposed. */ }
        if (taxSettings.status !== 'active' || !result.headOfficeConfigured) result.blockers.push(blocker('HEAD_OFFICE_REQUIRED', 'Active Stripe Tax settings and a complete US head office are required.'))
        if (taxSettings.defaults?.provider && taxSettings.defaults.provider !== 'stripe') result.blockers.push(blocker('STRIPE_TAX_PROVIDER_REQUIRED', 'Stripe Tax settings must use the Stripe provider.'))
        const registrations = await context.stripe.tax.registrations.list({ status: 'active', limit: 100 })
        requireValid(registrations?.has_more === false && Array.isArray(registrations.data) && registrations.data.length <= 100)
        const states = []
        for (const registration of registrations.data) {
          requireValid(registration.status === 'active' && registration.livemode === (context.mode === 'live'))
          if (registration.country !== 'US') continue
          const state = registration.country_options?.us?.state
          requireValid(US_STATES.includes(state))
          states.push(state)
        }
        result.activeRegistrationStates = [...new Set(states)].sort()
        if (!states.length) result.blockers.push(blocker('US_REGISTRATION_REQUIRED', 'An active US tax registration must be confirmed in Stripe.'))
        result.status = result.blockers.length ? 'not_configured' : 'ready'
        return result
      } catch {
        return { ...result, status: 'unavailable', headOfficeConfigured: false, activeRegistrationStates: [], blockers: [blocker('READINESS_UNAVAILABLE', 'Stripe Tax readiness could not be verified. Check account permissions and setup.')] }
      }
    }, result => result.status === 'ready' ? 30000 : 5000)
    return { result, context, key }
  }

  async function getTaxReadiness() {
    // Clone the safe projection so callers cannot modify cached readiness evidence.
    const { result } = await readiness(readConfig())
    return { ...result, activeRegistrationStates: [...result.activeRegistrationStates], blockers: result.blockers.map(item => ({ ...item })) }
  }

  async function calculateTax(input = {}) {
    const address = assertUsDestination(input.customer)
    const settings = readConfig(), base = baseReadiness(settings)
    const location = { country: 'US', ...(address.state ? { state: address.state } : {}), ...(address.city ? { city: address.city } : {}) }
    const zero = (provider, status) => freezeSnapshot({ version: 1, provider, status, taxAmount: 0, ratePercent: null, location, breakdown: [], calculatedAt: timestamp() })
    if (base.status === 'disabled') return zero('none', 'not_configured')
    if (base.provider !== 'stripe' || !base.productCodeConfigured) throw taxUnavailable()
    if (!['country', 'state', 'city', 'line1', 'postal_code'].every(key => address[key])) return zero('stripe', 'pending_address')
    const cart = prepareCart(input)
    const { result, context, key } = await readiness(settings)
    if (result.status !== 'ready') throw taxUnavailable()
    const calculationKey = hash([key, cart.identity, cart.total, cart.discount, cart.shipping, address])
    try {
      return await cached(calculationCache, calculationKey, async () => {
        const calculation = await context.stripe.tax.calculations.create({ currency: 'usd', customer_details: { address, address_source: 'shipping' },
          line_items: cart.lines.map(line => ({ ...line, tax_code: settings.productCode, tax_behavior: 'exclusive' })),
          shipping_cost: { amount: cart.shipping, tax_behavior: 'exclusive' },
          expand: ['line_items.data.tax_breakdown', 'shipping_cost.tax_breakdown'] })
        requireValid(Number.isSafeInteger(calculation?.expires_at) && calculation.expires_at * 1000 > clock())
        const snapshot = calculationSnapshot(calculation, { context, cart, address, productCode: settings.productCode, calculatedAt: timestamp() })
        return { snapshot, expiresAt: calculation.expires_at * 1000 }
      }, value => Math.max(0, Math.min(30000, value.expiresAt - clock()))).then(value => value.snapshot)
    } catch {
      readinessCache.delete(key)
      throw taxUnavailable()
    }
  }

  return { calculateTax, getTaxReadiness }
}

const service = createTaxService()
export const calculateTax = service.calculateTax
export const getTaxReadiness = service.getTaxReadiness
