import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, h, ref, watch } from 'vue'
import { useCheckoutShipping } from '../../../src/domains/checkout/composables/useCheckoutShipping.js'

const api = vi.hoisted(() => ({ options: vi.fn(), rates: vi.fn() }))
vi.mock('../../../src/domains/checkout/api/checkout.api.js', () => ({
  fetchCheckoutShippingOptions: api.options,
  fetchCheckoutShippingRates: api.rates,
}))

const fallbackMessage = 'Carrier rates are unavailable. Store shipping rates are shown.'
const staticResult = () => ({
  source: 'STATIC', defaultMethod: 'standard', message: fallbackMessage,
  options: [
    { method: 'standard', label: 'Standard shipping', price: '5.99', provider: 'STATIC' },
    { method: 'priority', label: 'Priority shipping', price: '11.99', provider: 'STATIC' },
  ],
})
const carrierResult = code => ({
  source: 'SHIPPO', defaultMethod: code, message: `Current ${code} options.`,
  options: [{ code, method: code, label: `${code} shipping`, price: 8,
    provider: 'SHIPPO', carrier: 'Fixture carrier', service: 'Fixture service', rateId: `fixture-${code}` }],
})
const apps = new Set()
function fixture({ watchInputs = false } = {}) {
  const customer = ref({
    firstName: 'Fixture', lastName: 'Person', email: 'fixture@example.test', phone: '5550100000',
    address1: '123 Example Lane', address2: '', city: 'Example City', state: 'CA', zip: '90001', country: 'US',
  })
  const cartItems = ref([{ productId: 'fixture-product', size: '6 oz', price: 10, quantity: 1 }])
  let state
  const renderer = createRenderer({ createElement: () => ({}), insert() {}, remove() {}, setElementText() {}, patchProp() {} })
  const app = renderer.createApp({ setup() {
    state = useCheckoutShipping(customer, cartItems)
    if (watchInputs) watch([customer, cartItems], state.scheduleShippingRates, { deep: true, flush: 'sync' })
    return () => h('div')
  } })
  app.mount({})
  apps.add(app)
  return { customer, cartItems, state, unmount() { app.unmount(); apps.delete(app) } }
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function displayed(state) {
  return {
    options: state.shippingOptions.value,
    selected: state.selectedShipping.value,
    payload: state.buildSelectedShippingPayload(),
    message: state.shippingRateMessage.value,
  }
}
async function startRates(flow) {
  flow.state.scheduleShippingRates()
  await vi.advanceTimersByTimeAsync(700)
}
async function finish(request, outcome, result = carrierResult('obsolete')) {
  if (outcome === 'success') request.resolve(result)
  else request.reject(new Error('PRIVATE_PROVIDER_DETAIL'))
  await vi.advanceTimersByTimeAsync(0)
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.resetAllMocks()
  vi.stubGlobal('window', { setTimeout, clearTimeout })
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network is prohibited in shipping fixtures.') }))
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  api.options.mockResolvedValue(staticResult())
  api.rates.mockResolvedValue(staticResult())
})
afterEach(() => {
  apps.forEach(app => app.unmount()); apps.clear()
  expect(fetch).not.toHaveBeenCalled()
  vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks()
})

describe('shipping rate readiness with actual composable scheduling', () => {
  it('marks the whole debounce and delayed request pending synchronously', async () => {
    const request = deferred(), flow = fixture()
    api.rates.mockReturnValueOnce(request.promise)
    flow.state.scheduleShippingRates()
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    expect(api.rates).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(699)
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    expect(api.rates).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(api.rates).toHaveBeenCalledOnce()
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    request.resolve(staticResult()); await vi.advanceTimersByTimeAsync(0)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })

  it('coalesces address and cart edits and sends a stable latest-input snapshot', async () => {
    const request = deferred(), flow = fixture()
    api.rates.mockReturnValueOnce(request.promise)
    flow.state.scheduleShippingRates()
    await vi.advanceTimersByTimeAsync(300)
    flow.customer.value.zip = '10001'
    flow.cartItems.value[0].quantity = 2
    flow.state.scheduleShippingRates()
    await vi.advanceTimersByTimeAsync(699)
    expect(api.rates).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(api.rates).toHaveBeenCalledExactlyOnceWith({
      customer: { ...flow.customer.value, country: 'United States' },
      cartItems: flow.cartItems.value,
    })
    flow.cartItems.value[0].quantity = 3
    expect(api.rates.mock.calls[0][0].cartItems[0].quantity).toBe(2)
    flow.state.scheduleShippingRates()
    request.resolve(carrierResult('obsolete')); await vi.advanceTimersByTimeAsync(0)
    expect(flow.state.selectedShipping.value).toBe('standard')
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
  })

  it.each(['address', 'cart'])('supports synchronous parent %s watchers without another refresh API', async input => {
    const flow = fixture({ watchInputs: true })
    await startRates(flow)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    if (input === 'address') flow.customer.value.zip = '10001'
    else flow.cartItems.value[0].quantity = 2
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    expect(api.rates).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(700)
    expect(api.rates).toHaveBeenCalledTimes(2)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })

  for (const phase of ['debounce', 'request', 'settled']) {
    it.each(['success', 'failure'])(`ignores an older %s during a newer ${phase}`, async outcome => {
      const old = deferred(), current = deferred(), flow = fixture()
      api.rates.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
      await startRates(flow)
      flow.customer.value.zip = '10001'
      flow.state.scheduleShippingRates()
      if (phase !== 'debounce') await vi.advanceTimersByTimeAsync(700)
      if (phase === 'settled') await finish(current, 'success', carrierResult('current'))
      const before = displayed(flow.state)
      await finish(old, outcome)
      expect(displayed(flow.state)).toEqual(before)
      expect(flow.state.isLoadingShippingRates.value).toBe(phase !== 'settled')
      expect(console.warn).not.toHaveBeenCalled()
      if (phase === 'debounce') await vi.advanceTimersByTimeAsync(700)
      if (phase !== 'settled') await finish(current, 'success', carrierResult('current'))
      expect(flow.state.selectedShipping.value).toBe('current')
      expect(flow.state.isLoadingShippingRates.value).toBe(false)
    })
  }

  it.each(['success', 'failure'])('does not apply an old %s even before a parent schedules changed inputs', async outcome => {
    const old = deferred(), flow = fixture()
    api.rates.mockReturnValueOnce(old.promise)
    await startRates(flow)
    const before = displayed(flow.state)
    flow.customer.value.address2 = 'Unit 2'
    await finish(old, outcome)
    expect(displayed(flow.state)).toEqual(before)
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    flow.state.scheduleShippingRates(); await vi.advanceTimersByTimeAsync(700)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })

  it('accepts successful STATIC options, retains the selected available method and keeps the payload shape', async () => {
    const flow = fixture()
    await flow.state.loadShippingOptions()
    flow.state.selectedShipping.value = 'priority'
    await startRates(flow)
    expect(flow.state.selectedShipping.value).toBe('priority')
    expect(flow.state.shippingPrice.value).toBe(11.99)
    expect(flow.state.buildSelectedShippingPayload()).toEqual({
      method: 'priority', price: 11.99, provider: 'STATIC', rateId: null,
      carrier: null, service: 'Priority shipping',
    })
    expect(flow.state.shippingRateMessage.value).toBe(fallbackMessage)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('uses the current default when the selected method is unavailable', async () => {
    const flow = fixture()
    flow.state.selectedShipping.value = 'priority'
    api.rates.mockResolvedValueOnce(carrierResult('current'))
    await startRates(flow)
    expect(flow.state.buildSelectedShippingPayload()).toEqual({
      method: 'current', price: 8, provider: 'SHIPPO', rateId: 'fixture-current',
      carrier: 'Fixture carrier', service: 'Fixture service',
    })
  })

  it('retains existing fallback options and safe feedback on a current failed request, then retries', async () => {
    const flow = fixture(), before = flow.state.shippingOptions.value
    api.rates.mockRejectedValueOnce(new Error('PRIVATE_PROVIDER_DETAIL'))
    await startRates(flow)
    expect(flow.state.shippingOptions.value).toBe(before)
    expect(flow.state.shippingRateMessage.value).toBe(fallbackMessage)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    expect(console.warn).toHaveBeenCalledExactlyOnceWith('[checkout] Shipping rate refresh failed.')
    await startRates(flow)
    expect(flow.state.buildSelectedShippingPayload().provider).toBe('STATIC')
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })
})

describe('options bootstrap and rate request ordering', () => {
  it.each(['success', 'failure'])('ignores delayed bootstrap %s after newer rates are accepted', async outcome => {
    const old = deferred(), flow = fixture()
    api.options.mockReturnValueOnce(old.promise)
    const bootstrap = flow.state.loadShippingOptions()
    api.rates.mockResolvedValueOnce(carrierResult('current'))
    await startRates(flow)
    const before = displayed(flow.state)
    await finish(old, outcome, staticResult()); await bootstrap
    expect(displayed(flow.state)).toEqual(before)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it.each(['success', 'failure'])('does not let older rate %s settle or replace a newer options load', async outcome => {
    const old = deferred(), current = deferred(), flow = fixture()
    api.rates.mockReturnValueOnce(old.promise)
    await startRates(flow)
    api.options.mockReturnValueOnce(current.promise)
    const optionsLoad = flow.state.loadShippingOptions()
    const before = displayed(flow.state)
    await finish(old, outcome)
    expect(displayed(flow.state)).toEqual(before)
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    current.resolve(staticResult()); await optionsLoad
    expect(flow.state.buildSelectedShippingPayload().provider).toBe('STATIC')
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })

  it('keeps loading true until the latest overlapping options request settles', async () => {
    const old = deferred(), current = deferred(), flow = fixture()
    api.options.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const first = flow.state.loadShippingOptions(), second = flow.state.loadShippingOptions()
    old.resolve(carrierResult('obsolete')); await first
    expect(flow.state.selectedShipping.value).toBe('standard')
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    current.resolve(staticResult()); await second
    expect(flow.state.buildSelectedShippingPayload().provider).toBe('STATIC')
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })
})

describe('invalid destinations, empty bags and component disposal', () => {
  const invalidations = [
    ['street', flow => { flow.customer.value.address1 = ' ' }],
    ['city', flow => { flow.customer.value.city = '' }],
    ['state', flow => { flow.customer.value.state = '' }],
    ['ZIP', flow => { flow.customer.value.zip = '' }],
    ['non-US country', flow => { flow.customer.value.country = 'CA' }],
    ['unsupported US territory', flow => { flow.customer.value.state = 'PR' }],
    ['empty bag', flow => { flow.cartItems.value = [] }],
  ]
  it.each(invalidations)('invalidates in-flight work on %s changes and permits a later valid retry', async (_label, invalidate) => {
    const old = deferred(), flow = fixture({ watchInputs: true })
    const original = { ...flow.customer.value }, originalItems = [...flow.cartItems.value]
    api.rates.mockReturnValueOnce(old.promise)
    await startRates(flow)
    const before = displayed(flow.state)
    invalidate(flow)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    await finish(old, 'success')
    await vi.advanceTimersByTimeAsync(700)
    expect(displayed(flow.state)).toEqual(before)
    expect(api.rates).toHaveBeenCalledOnce()
    flow.customer.value = original; flow.cartItems.value = originalItems
    expect(flow.state.isLoadingShippingRates.value).toBe(true)
    await vi.advanceTimersByTimeAsync(700)
    expect(api.rates).toHaveBeenCalledTimes(2)
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
  })

  it.each(['incomplete', 'non-US'])('cancels a debounce and ignores a late error after becoming %s', async kind => {
    const old = deferred(), flow = fixture()
    api.rates.mockReturnValueOnce(old.promise)
    await startRates(flow)
    flow.state.scheduleShippingRates()
    if (kind === 'incomplete') flow.customer.value.zip = ''
    else flow.customer.value.country = 'Canada'
    flow.state.scheduleShippingRates()
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    await finish(old, 'failure'); await vi.advanceTimersByTimeAsync(700)
    expect(api.rates).toHaveBeenCalledOnce()
    expect(flow.state.shippingRateMessage.value).toBe('')
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('cancels debounced work on unmount', async () => {
    const flow = fixture()
    flow.state.scheduleShippingRates(); flow.unmount()
    expect(flow.state.isLoadingShippingRates.value).toBe(false)
    await vi.advanceTimersByTimeAsync(700)
    expect(api.rates).not.toHaveBeenCalled()
  })

  for (const endpoint of ['rates', 'options']) {
    it.each(['success', 'failure'])(`ignores late ${endpoint} %s after unmount`, async outcome => {
      const old = deferred(), flow = fixture()
      api[endpoint].mockReturnValueOnce(old.promise)
      let pending
      if (endpoint === 'options') pending = flow.state.loadShippingOptions()
      else await startRates(flow)
      const before = displayed(flow.state)
      flow.unmount()
      await finish(old, outcome); await pending
      expect(displayed(flow.state)).toEqual(before)
      expect(flow.state.isLoadingShippingRates.value).toBe(false)
      expect(console.warn).not.toHaveBeenCalled()
      const calls = api[endpoint].mock.calls.length
      flow.state.scheduleShippingRates(); await flow.state.loadShippingOptions()
      await vi.advanceTimersByTimeAsync(700)
      expect(api[endpoint]).toHaveBeenCalledTimes(calls)
    })
  }
})
