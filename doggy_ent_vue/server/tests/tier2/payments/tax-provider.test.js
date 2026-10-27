import { describe, expect, it, vi } from 'vitest'
import { createTaxService, getTaxConfig, calculateTax, getTaxReadiness } from '../../../src/shared/services/tax.service.js'
import { assertUsDestination, normalizeUsAddress, US_STATES } from '../../../src/shared/utils/usAddress.js'
import { mapPublicTaxDetails, validateTaxSnapshot, MAX_TAX_SNAPSHOT_BYTES } from '../../../src/shared/utils/taxSnapshot.js'

const customer = { country: 'United States', address1: '100 Example St', address2: 'Unit 2', city: 'Example City', state: 'CA', zip: '90001' }
const approvedCode = 'txcd_12345678' // Synthetic classification; never sent to Stripe.
const input = { cartItems: [{ id: 'treat1', sku: 'SKU1', size: 'small', price: 10, quantity: 2 }], subtotal: 20, discountAmount: 0, shippingAmount: 5, customer }
const privateCanary = 'private-provider-canary'
const rates = [{ percentage: '6', level: 'state', name: 'California' }, { percentage: '2', level: 'county', name: 'Example County' }]

function fixture(configOverrides = {}) {
  let time = Date.parse('2026-10-27T12:00:00Z')
  const config = { provider: 'stripe', productCode: approvedCode, liveEnabled: false, ...configOverrides }
  const context = { mode: 'sandbox', accountId: 'acct_taxFixture' }
  const retrieve = vi.fn(async () => ({ status: 'active', livemode: context.mode === 'live', head_office: { address: normalizeUsAddress(customer) }, defaults: { provider: 'stripe' } }))
  const list = vi.fn(async () => ({ has_more: false, data: [{ id: privateCanary, status: 'active', country: 'US', country_options: { us: { state: 'CA' } }, livemode: context.mode === 'live' }] }))
  const response = (params, components = rates, reason = 'standard_rated') => {
    const summary = new Map()
    function rows(amount) {
      return components.map((component, index) => {
        const tax = Math.round(amount * Number(component.percentage) / 100)
        const previous = summary.get(index) || { amount: 0, taxable_amount: 0, inclusive: false, tax_rate_details: { country: 'US', state: 'CA', rate_type: component.flat ? 'flat_amount' : 'percentage', flat_amount: component.flat ? { amount: 1, currency: 'usd' } : null, percentage_decimal: component.percentage, tax_type: 'sales_tax' }, taxability_reason: reason }
        previous.amount += tax
        previous.taxable_amount += amount
        summary.set(index, previous)
        return { amount: tax, taxable_amount: amount, tax_rate_details: { percentage_decimal: component.percentage, tax_type: 'sales_tax' }, jurisdiction: { country: 'US', state: 'CA', level: component.level, display_name: component.name }, taxability_reason: reason, sourcing: 'destination' }
      })
    }
    const lineItems = params.line_items.map(line => {
      const tax_breakdown = rows(line.amount)
      return { ...line, id: 'tax_li_fixture', livemode: context.mode === 'live', amount_tax: tax_breakdown.reduce((sum, row) => sum + row.amount, 0), tax_breakdown }
    })
    const shippingRows = rows(params.shipping_cost.amount)
    const shipping = { ...params.shipping_cost, amount_tax: shippingRows.reduce((sum, row) => sum + row.amount, 0), tax_code: 'shipping-default', tax_breakdown: shippingRows }
    const tax = [...summary.values()].reduce((sum, row) => sum + row.amount, 0)
    return { id: 'taxcalc_fixture', currency: 'usd', livemode: context.mode === 'live', amount_total: params.line_items.reduce((sum, line) => sum + line.amount, 0) + params.shipping_cost.amount + tax,
      tax_amount_exclusive: tax, tax_amount_inclusive: 0, expires_at: Math.floor(time / 1000) + 3600,
      line_items: { has_more: false, data: lineItems }, shipping_cost: shipping, tax_breakdown: [...summary.values()] }
  }
  const create = vi.fn(async params => response(params))
  const stripe = { tax: { settings: { retrieve, update: vi.fn() }, registrations: { list, create: vi.fn(), update: vi.fn() }, calculations: { create } } }
  context.stripe = stripe
  const getContext = vi.fn(async () => ({ ...context }))
  const service = createTaxService({ getContext, config: () => config, clock: () => time })
  return { config, context, stripe, getContext, retrieve, list, create, response, service, advance: ms => { time += ms } }
}

const unavailable = { statusCode: 503, code: 'TAX_UNAVAILABLE', message: 'Tax calculation is temporarily unavailable. Please try again.' }

describe('tax configuration and US address boundary', () => {
  it('exports the parent integration functions', () => {
    for (const fn of [calculateTax, getTaxReadiness, assertUsDestination, normalizeUsAddress, validateTaxSnapshot, mapPublicTaxDetails]) expect(typeof fn).toBe('function')
  })

  it.each([undefined, '', 'none', 'disabled'])('disables tax without even verifying Stripe for %j', async provider => {
    const f = fixture({ provider })
    expect(await f.service.calculateTax(input)).toMatchObject({ version: 1, provider: 'none', status: 'not_configured', taxAmount: 0, ratePercent: null, breakdown: [] })
    expect(await f.service.getTaxReadiness()).toEqual({ provider: 'none', mode: 'unconfigured', status: 'disabled', productCodeConfigured: true, headOfficeConfigured: false, activeRegistrationStates: [], checkedAt: null, blockers: [] })
    expect(f.getContext).not.toHaveBeenCalled()
  })

  it.each(['local', 'LOCAL', 'unknown', ' stripe '])('blocks unsupported provider %j without approximation', async provider => {
    const f = fixture({ provider })
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    expect(await f.service.getTaxReadiness()).toMatchObject({ provider: 'none', status: 'not_configured', blockers: [{ code: 'UNSUPPORTED_PROVIDER' }] })
    expect(f.getContext).not.toHaveBeenCalled()
  })

  it.each(['', 'txcd_bad', 'txcd_1234567', ' txcd_12345678', 'txcd_123456789', privateCanary])('requires an explicit canonical product-code format: %j', async productCode => {
    const f = fixture({ productCode })
    expect(await f.service.getTaxReadiness()).toMatchObject({ status: 'not_configured', productCodeConfigured: false, blockers: [{ code: 'PRODUCT_CODE_REQUIRED' }] })
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    expect(f.getContext).not.toHaveBeenCalled()
  })

  it('has no environment fallback category or live activation', () => {
    expect(getTaxConfig({})).toEqual({ provider: 'none', productCode: '', liveEnabled: false })
    for (const flag of [undefined, '', 'TRUE', '1', ' true ']) expect(getTaxConfig({ STRIPE_TAX_LIVE_ENABLED: flag }).liveEnabled).toBe(false)
    expect(getTaxConfig({ STRIPE_TAX_LIVE_ENABLED: 'true' }).liveEnabled).toBe(true)
  })

  it('accepts injected environment-style configuration', async () => {
    const getContext = vi.fn()
    const service = createTaxService({ config: { TAX_PROVIDER: 'disabled' }, getContext })
    expect((await service.calculateTax(input)).taxAmount).toBe(0)
    expect(getContext).not.toHaveBeenCalled()
  })

  it.each(['us', 'US', ' United States ', 'united states'])('normalizes country %j and only address fields', country => {
    expect(normalizeUsAddress({ ...customer, country, state: 'ca', email: privateCanary })).toEqual({ country: 'US', state: 'CA', city: 'Example City', line1: '100 Example St', line2: 'Unit 2', postal_code: '90001' })
    expect(normalizeUsAddress(normalizeUsAddress(customer))).toEqual(normalizeUsAddress(customer))
  })

  it('validates all 50 states and DC and ZIP+4', () => {
    expect(US_STATES).toHaveLength(51)
    for (const state of US_STATES) expect(assertUsDestination({ ...customer, state, zip: '90001-1234' }, { allowIncomplete: false }).state).toBe(state)
  })

  it.each([{ country: 'CA' }, { country: 'USA' }, { state: 'PR' }, { state: 'ZZ' }, { zip: '9000' }, { zip: 'ABCDE' }, { zip: '900011234' }, { zip: 90001 }, { city: 'a\nprivate' }])('rejects invalid destination data %j even when tax is disabled', async patch => {
    const f = fixture({ provider: 'none' })
    expect(() => assertUsDestination({ ...customer, ...patch })).toThrow()
    await expect(f.service.calculateTax({ ...input, customer: { ...customer, ...patch } })).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_US_DESTINATION' })
    expect(f.getContext).not.toHaveBeenCalled()
  })

  it.each(['country', 'address1', 'city', 'state', 'zip'])('returns pending_address for missing %s but creation requires the full address', async key => {
    const f = fixture(), address = { ...customer, [key]: '' }
    expect((await f.service.calculateTax({ ...input, customer: address }))).toMatchObject({ provider: 'stripe', status: 'pending_address', taxAmount: 0, ratePercent: null })
    expect(() => assertUsDestination(address, { allowIncomplete: false })).toThrow('Complete your US shipping address')
    expect(f.getContext).not.toHaveBeenCalled()
  })
})

describe('read-only Stripe Tax readiness', () => {
  it('returns the exact safe admin contract, never an address or registration ID', async () => {
    const f = fixture()
    const result = await f.service.getTaxReadiness()
    expect(result).toEqual({ provider: 'stripe', mode: 'sandbox', status: 'ready', headOfficeConfigured: true, productCodeConfigured: true, activeRegistrationStates: ['CA'], checkedAt: '2026-10-27T12:00:00.000Z', blockers: [] })
    expect(f.list).toHaveBeenCalledExactlyOnceWith({ status: 'active', limit: 100 })
    expect(JSON.stringify(result)).not.toContain(privateCanary)
    expect(JSON.stringify(result)).not.toContain(customer.address1)
    expect(f.stripe.tax.settings.update).not.toHaveBeenCalled()
    expect(f.stripe.tax.registrations.create).not.toHaveBeenCalled()
    expect(f.stripe.tax.registrations.update).not.toHaveBeenCalled()
    expect(f.create).not.toHaveBeenCalled()
    result.activeRegistrationStates.push('NY')
    expect((await f.service.getTaxReadiness()).activeRegistrationStates).toEqual(['CA'])
  })

  it.each([null, { address: { country: 'US' } }, { address: { ...normalizeUsAddress(customer), country: 'CA' } }])('blocks missing/incomplete/non-US head office %j', async head_office => {
    const f = fixture()
    f.retrieve.mockResolvedValue({ status: 'active', livemode: false, head_office })
    expect(await f.service.getTaxReadiness()).toMatchObject({ status: 'not_configured', headOfficeConfigured: false, blockers: [{ code: 'HEAD_OFFICE_REQUIRED' }] })
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    expect(f.create).not.toHaveBeenCalled()
  })

  it('does not infer readiness from an address while settings are pending', async () => {
    const f = fixture()
    f.retrieve.mockResolvedValue({ status: 'pending', livemode: false, head_office: { address: normalizeUsAddress(customer) } })
    expect((await f.service.getTaxReadiness()).status).toBe('not_configured')
  })

  it.each([
    { has_more: false, data: [] },
    { has_more: true, data: [] },
    { data: [] },
    { has_more: false, data: [{ country: 'US', status: 'scheduled', livemode: false, country_options: { us: { state: 'CA' } } }] },
    { has_more: false, data: [{ country: 'US', status: 'active', livemode: true, country_options: { us: { state: 'CA' } } }] },
    { has_more: false, data: [{ country: 'US', status: 'active', livemode: false, country_options: { us: { state: 'ZZ' } } }] },
    { has_more: false, data: [{ country: 'CA', status: 'active', livemode: false }] },
  ])('requires a complete verified active US registration list: %j', async registrations => {
    const f = fixture()
    f.list.mockResolvedValue(registrations)
    expect((await f.service.getTaxReadiness()).status).not.toBe('ready')
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    expect(f.create).not.toHaveBeenCalled()
  })

  it('does not require a registration for the destination or infer nexus; Stripe decides collection', async () => {
    const f = fixture()
    expect((await f.service.calculateTax({ ...input, customer: { ...customer, state: 'OR', zip: '97001' } })).provider).toBe('stripe')
    expect(f.create).toHaveBeenCalledOnce()
  })

  it('blocks every live Tax call unless explicitly enabled and never changes payment gates', async () => {
    const f = fixture()
    f.context.mode = 'live'
    expect(await f.service.getTaxReadiness()).toMatchObject({ mode: 'live', status: 'not_configured', blockers: [{ code: 'LIVE_TAX_DISABLED' }] })
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    expect(f.retrieve).not.toHaveBeenCalled()
    expect(f.list).not.toHaveBeenCalled()
    f.config.liveEnabled = true
    expect((await f.service.calculateTax(input)).mode).toBe('live')
  })

  it('fails safely on account verification or wrong-mode settings', async () => {
    const f = fixture()
    f.getContext.mockRejectedValueOnce(new Error(privateCanary))
    expect(await f.service.getTaxReadiness()).toMatchObject({ status: 'unavailable', blockers: [{ code: 'ACCOUNT_UNVERIFIED' }] })
    f.retrieve.mockResolvedValue({ status: 'active', livemode: true })
    expect(JSON.stringify(await f.service.getTaxReadiness())).not.toContain(privateCanary)
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
  })

  it('coalesces readiness, expires success at 30 seconds and failure at 5 without stale success', async () => {
    const f = fixture()
    await Promise.all(Array.from({ length: 8 }, () => f.service.getTaxReadiness()))
    expect(f.retrieve).toHaveBeenCalledOnce()
    f.advance(29999)
    expect((await f.service.getTaxReadiness()).status).toBe('ready')
    f.retrieve.mockRejectedValue(new Error(privateCanary))
    f.advance(1)
    expect((await f.service.getTaxReadiness()).status).toBe('unavailable')
    expect(f.retrieve).toHaveBeenCalledTimes(2)
    f.advance(4999)
    expect((await f.service.getTaxReadiness()).status).toBe('unavailable')
    expect(f.retrieve).toHaveBeenCalledTimes(2)
    f.advance(1)
    await f.service.getTaxReadiness()
    expect(f.retrieve).toHaveBeenCalledTimes(3)
  })

  it('scopes readiness to the exact account, client, mode and product configuration', async () => {
    const f = fixture()
    await f.service.getTaxReadiness()
    f.context.accountId = 'acct_otherFixture'
    await f.service.getTaxReadiness()
    f.config.productCode = 'txcd_87654321'
    await f.service.getTaxReadiness()
    f.context.stripe = { ...f.stripe }
    await f.service.getTaxReadiness()
    f.config.liveEnabled = true
    f.context.mode = 'live'
    await f.service.getTaxReadiness()
    expect(f.retrieve).toHaveBeenCalledTimes(5)
  })
})

describe('trusted calculation amounts and provider evidence', () => {
  it('sends total line amounts for quantities, separate exclusive shipping, and no giving/contact overrides', async () => {
    const f = fixture()
    const result = await f.service.calculateTax({ ...input, givingAmount: 123, customer: { ...customer, taxability_override: 'customer_exempt', email: privateCanary } })
    expect(f.create).toHaveBeenCalledExactlyOnceWith({ currency: 'usd', customer_details: { address: normalizeUsAddress(customer), address_source: 'shipping' },
      line_items: [{ amount: 2000, quantity: 2, reference: 'line_1', tax_code: approvedCode, tax_behavior: 'exclusive' }],
      shipping_cost: { amount: 500, tax_behavior: 'exclusive' }, expand: ['line_items.data.tax_breakdown', 'shipping_cost.tax_breakdown'] })
    expect(result).toMatchObject({ version: 1, provider: 'stripe', status: 'calculated', taxAmount: 2, ratePercent: '8', calculationId: 'taxcalc_fixture', mode: 'sandbox' })
    expect(result.breakdown).toEqual([{ label: 'California state tax', ratePercent: '6', taxAmount: 1.5, taxableAmount: 25, taxabilityReason: 'standard_rated' }, { label: 'Example County county tax', ratePercent: '2', taxAmount: 0.5, taxableAmount: 25, taxabilityReason: 'standard_rated' }])
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.location)).toBe(true)
    expect(Object.isFrozen(result.breakdown[0])).toBe(true)
  })

  it('allocates discount pennies proportionally with stable largest-remainder ties', async () => {
    const f = fixture()
    await f.service.calculateTax({ ...input, subtotal: 0.05, discountAmount: 0.02, shippingAmount: 0, cartItems: [{ id: 'a', price: 0.01, quantity: 1 }, { id: 'b', price: 0.01, quantity: 1 }, { id: 'c', price: 0.03, quantity: 1 }] })
    expect(f.create.mock.calls[0][0].line_items.map(line => line.amount)).toEqual([0, 1, 2])
    expect(f.create.mock.calls[0][0].line_items.every(line => line.tax_code === approvedCode)).toBe(true)
  })

  it('keeps line totals exact for a discount not divisible by quantity', async () => {
    const f = fixture()
    await f.service.calculateTax({ ...input, discountAmount: 0.01 })
    expect(f.create.mock.calls[0][0].line_items[0]).toMatchObject({ amount: 1999, quantity: 2 })
  })

  it.each([{ subtotal: 19 }, { subtotal: NaN }, { discountAmount: 20.01 }, { shippingAmount: -1 }, { cartItems: [] }, { cartItems: [{ price: 1.001, quantity: 1 }] }, { cartItems: [{ price: 10, quantity: 1.5 }] }, { cartItems: [{ price: 10, quantity: 1000 }] }])('rejects inconsistent trusted inputs %j before Stripe', async patch => {
    const f = fixture()
    await expect(f.service.calculateTax({ ...input, ...patch })).rejects.toMatchObject(unavailable)
    expect(f.getContext).not.toHaveBeenCalled()
    expect(f.create).not.toHaveBeenCalled()
  })

  it('preserves not_collecting, rather than inventing an exemption or 0% rate', async () => {
    const f = fixture()
    f.create.mockImplementation(async params => f.response(params, [{ ...rates[0], percentage: '0' }], 'not_collecting'))
    const result = await f.service.calculateTax(input)
    expect(result).toMatchObject({ status: 'not_collecting', taxAmount: 0, ratePercent: null })
    expect(result.breakdown[0].taxabilityReason).toBe('not_collecting')
    expect(mapPublicTaxDetails(result).status).toBe('not_collecting')
  })

  it('preserves a real product-exempt reason separately from not_collecting', async () => {
    const f = fixture()
    f.create.mockImplementation(async params => f.response(params, [{ ...rates[0], percentage: '0' }], 'product_exempt'))
    const result = await f.service.calculateTax(input)
    expect(result).toMatchObject({ status: 'calculated', taxAmount: 0, ratePercent: '0' })
    expect(result.breakdown[0].taxabilityReason).toBe('product_exempt')
  })

  it('does not infer a percentage by dividing rounded tax by subtotal', async () => {
    const f = fixture()
    const result = await f.service.calculateTax({ ...input, subtotal: 0.01, shippingAmount: 0, cartItems: [{ price: 0.01, quantity: 1 }] })
    expect(result.taxAmount).toBe(0)
    expect(result.ratePercent).toBe('8')
  })

  it('suppresses a top percentage for different taxable bases or a flat component', async () => {
    for (const mixed of [true, false]) {
      const f = fixture()
      f.create.mockImplementation(async params => {
        const result = f.response(params, mixed ? rates : [{ ...rates[0], flat: true }])
        if (mixed) result.tax_breakdown[1].taxable_amount -= 1
        return result
      })
      expect((await f.service.calculateTax(input)).ratePercent).toBeNull()
    }
  })

  it.each([
    result => { result.currency = 'eur' },
    result => { result.livemode = true },
    result => { result.id = 'pi_private' },
    result => { result.id = null },
    result => { result.tax_amount_inclusive = 1 },
    result => { result.tax_amount_exclusive = -1 },
    result => { result.amount_total += 1 },
    result => { result.tax_breakdown[0].amount += 1 },
    result => { result.line_items.has_more = true },
    result => { result.line_items.data[0].quantity = 1 },
    result => { result.line_items.data[0].amount = 1000 },
    result => { result.line_items.data[0].tax_behavior = 'inclusive' },
    result => { result.line_items.data[0].tax_code = 'txcd_87654321' },
    result => { result.line_items.data[0].tax_breakdown = [] },
    result => { result.line_items.data[0].tax_breakdown[0].taxability_reason = 'private_canary' },
    result => { result.line_items.data[0].tax_breakdown[0].jurisdiction.country = 'CA' },
    result => { result.shipping_cost.amount += 1 },
    result => { result.shipping_cost.tax_breakdown = undefined },
    result => { result.expires_at = 1 },
    result => { result.tax_breakdown = Array(21).fill(result.tax_breakdown[0]) },
  ])('fails closed on malformed, incomplete or mismatched Stripe response %#', async mutate => {
    const f = fixture()
    f.create.mockImplementation(async params => { const result = f.response(params); mutate(result); return result })
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
  })
})

describe('bounded exact-input caches', () => {
  it('coalesces identical calculations and expires at 30 seconds', async () => {
    const f = fixture()
    const results = await Promise.all(Array.from({ length: 8 }, () => f.service.calculateTax(input)))
    expect(f.create).toHaveBeenCalledOnce()
    expect(results.every(result => result === results[0])).toBe(true)
    f.advance(29999)
    await f.service.calculateTax(input)
    expect(f.create).toHaveBeenCalledOnce()
    f.advance(1)
    await f.service.calculateTax(input)
    expect(f.create).toHaveBeenCalledTimes(2)
  })

  it('keys calculations by cart identity, discount, shipping, address, account and configuration', async () => {
    const f = fixture()
    await f.service.calculateTax(input)
    await f.service.calculateTax({ ...input, discountAmount: 1 })
    await f.service.calculateTax({ ...input, shippingAmount: 1 })
    await f.service.calculateTax({ ...input, cartItems: [{ ...input.cartItems[0], id: 'treat2' }] })
    await f.service.calculateTax({ ...input, customer: { ...customer, address2: 'Unit 3' } })
    f.context.accountId = 'acct_changed'
    await f.service.calculateTax(input)
    f.config.productCode = 'txcd_87654321'
    await f.service.calculateTax(input)
    expect(f.create).toHaveBeenCalledTimes(7)
  })

  it('does not retain more than 100 calculation or readiness entries', async () => {
    const f = fixture()
    for (let i = 0; i <= 100; i += 1) await f.service.calculateTax({ ...input, customer: { ...customer, address2: `Unit ${i}` } })
    await f.service.calculateTax({ ...input, customer: { ...customer, address2: 'Unit 0' } })
    expect(f.create).toHaveBeenCalledTimes(102)
    const g = fixture()
    for (let i = 0; i <= 100; i += 1) { g.context.accountId = `acct_fixture${i}`; await g.service.getTaxReadiness() }
    g.context.accountId = 'acct_fixture0'
    await g.service.getTaxReadiness()
    expect(g.retrieve).toHaveBeenCalledTimes(102)
  })

  it('never falls back to expired success or caches a provider failure', async () => {
    const f = fixture()
    await f.service.calculateTax(input)
    f.advance(30000)
    f.create.mockRejectedValueOnce(Object.assign(new Error(privateCanary), { raw: { secret: privateCanary } }))
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    const success = await f.service.calculateTax(input)
    expect(success.status).toBe('calculated')
    expect(f.create).toHaveBeenCalledTimes(3)
    expect(JSON.stringify(success)).not.toContain(privateCanary)
  })

  it('never serves a cached calculation when fresh readiness fails', async () => {
    const f = fixture()
    await f.service.calculateTax(input)
    f.getContext.mockRejectedValue(new Error(privateCanary))
    await expect(f.service.calculateTax(input)).rejects.toMatchObject(unavailable)
    expect(f.create).toHaveBeenCalledOnce()
  })
})

describe('bounded proof snapshots and repeatable public projection', () => {
  it('returns a sanitized independent clone with required provider linkage', async () => {
    const f = fixture(), snapshot = await f.service.calculateTax(input)
    const hostile = { ...snapshot, privateCanary, location: { ...snapshot.location, line1: privateCanary }, breakdown: snapshot.breakdown.map(row => ({ ...row, permitId: privateCanary })) }
    const result = validateTaxSnapshot(hostile)
    expect(result).toEqual(snapshot)
    expect(result).not.toBe(snapshot)
    expect(result.location).not.toBe(snapshot.location)
    expect(JSON.stringify(result)).not.toContain(privateCanary)
    const { mode, ...noMode } = snapshot
    expect(() => validateTaxSnapshot(noMode)).toThrow('Tax details could not be verified')
    const { calculationId, ...noCalculation } = snapshot
    expect(() => validateTaxSnapshot(noCalculation)).toThrow('Tax details could not be verified')
    expect(() => validateTaxSnapshot({ ...snapshot, mode: 'test' })).toThrow('Tax details could not be verified')
  })

  it('projects only explicit public fields, handles already-public input and verifies expected tax', async () => {
    const f = fixture(), snapshot = await f.service.calculateTax(input)
    const details = mapPublicTaxDetails({ ...snapshot, privateCanary }, 2)
    expect(Object.keys(details)).toEqual(['provider', 'status', 'taxAmount', 'ratePercent', 'location', 'breakdown', 'calculatedAt'])
    expect(details.location).toEqual({ country: 'US', state: 'CA', city: 'Example City' })
    expect(mapPublicTaxDetails({ ...details, privateCanary, calculationId: privateCanary, mode: privateCanary }, 2)).toEqual(details)
    expect(mapPublicTaxDetails(mapPublicTaxDetails(details, 2), 2)).toEqual(details)
    expect(mapPublicTaxDetails(snapshot, 1)).toBeNull()
    expect(mapPublicTaxDetails(null)).toBeNull()
  })

  it('enforces the original signed-payload UTF-8 byte limit before discarding unknown fields', async () => {
    const f = fixture(), snapshot = await f.service.calculateTax(input)
    expect(Buffer.byteLength(JSON.stringify(snapshot))).toBeLessThan(MAX_TAX_SNAPSHOT_BYTES)
    expect(() => validateTaxSnapshot({ ...snapshot, extra: 'x'.repeat(3500) })).toThrow('Tax details could not be verified')
    expect(() => validateTaxSnapshot({ ...snapshot, extra: '\u00e9'.repeat(1750) })).toThrow('Tax details could not be verified')
    expect(mapPublicTaxDetails({ ...snapshot, extra: 'x'.repeat(3500) })).toBeNull()
  })

  it.each([
    value => { value.version = 2 },
    value => { value.taxAmount = -1 },
    value => { value.taxAmount = 2.001 },
    value => { value.taxAmount = '2.00' },
    value => { value.ratePercent = 8 },
    value => { value.ratePercent = 'NaN' },
    value => { value.ratePercent = '9' },
    value => { value.location.country = 'CA' },
    value => { value.location.state = 'PR' },
    value => { value.calculationId = 'pi_wrong' },
    value => { value.calculatedAt = '2026-02-30T00:00:00.000Z' },
    value => { value.breakdown[0].taxAmount = 0 },
    value => { value.breakdown[0].taxabilityReason = 'exempt' },
    value => { value.breakdown[0].label = '<script>secret</script>' },
    value => { value.breakdown = Array(13).fill(value.breakdown[0]) },
    value => { value.status = 'not_configured' },
    value => { value.status = 'not_collecting' },
  ])('rejects malformed or inconsistent signed tax snapshot %# with a safe message', async mutate => {
    const f = fixture(), value = validateTaxSnapshot(await f.service.calculateTax(input))
    mutate(value)
    expect(() => validateTaxSnapshot(value)).toThrow('Tax details could not be verified')
    expect(mapPublicTaxDetails(value)).toBeNull()
  })
})
