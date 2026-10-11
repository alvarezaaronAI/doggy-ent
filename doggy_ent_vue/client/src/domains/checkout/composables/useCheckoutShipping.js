import { computed, onBeforeUnmount, ref } from 'vue'
import { fetchCheckoutShippingRates, fetchCheckoutShippingOptions } from '../api/checkout.api.js'
export function useCheckoutShipping(customer, cartItems) {
const selectedShipping = ref('standard')
const shippingOptions = ref([
  {
    code: 'standard',
    label: 'Standard shipping',
    description: 'Estimated arrival in 3-5 business days.',
    price: 5.99,
  },
  {
    code: 'priority',
    label: 'Priority shipping',
    description: 'Estimated arrival in 1-2 business days.',
    price: 11.99,
  },
])
const isLoadingShippingRates = ref(false)
const shippingRateMessage = ref('')
let shippingRateTimer = null
const selectedShippingOption = computed(() =>
  shippingOptions.value.find((option) => option.code === selectedShipping.value) || null,
)

const shippingPrice = computed(() =>
  selectedShippingOption.value?.price || 0
)

function buildSelectedShippingPayload() {
  const option = selectedShippingOption.value || {}

  return {
    method: option.method || option.code || selectedShipping.value,
    price: shippingPrice.value,
    rateId: option.rateId || null,
    provider: option.provider || null,
    carrier: option.carrier || null,
    service: option.service || option.label || null,
  }
}

function normalizeShippingOption(option = {}) {
  const code = option.code || option.method

  return {
    code,
    method: option.method || code,
    rateId: option.rateId || null,
    provider: option.provider || null,
    carrier: option.carrier || null,
    service: option.service || option.label || null,
    label:
      option.label
      || `${String(option.method || code).replaceAll('-', ' ')} shipping`,
    description: option.description || 'Shipping calculated by the server.',
    price: Number(option.price || 0),
  }
}


async function loadShippingOptions() {
  try {
    const result = await fetchCheckoutShippingOptions()
    const options = Array.isArray(result?.options)
      ? result.options
      : []

    if (options.length) {
      shippingOptions.value = options.map(normalizeShippingOption)
      selectedShipping.value =
        result.defaultMethod
        || shippingOptions.value[0]?.code
        || selectedShipping.value
      shippingRateMessage.value = result.message || ''
    }
  }
  catch (error) {
    console.warn(
      '[checkout] Using local fallback shipping options.',
      error,
    )
  }
}

function hasShippingAddress() {
  return [
    customer.value.address1,
    customer.value.city,
    customer.value.state,
    customer.value.zip,
  ].every((value) => String(value || '').trim())
}

async function loadShippingRates() {
  if (!cartItems.value.length || !hasShippingAddress()) {
    return
  }

  isLoadingShippingRates.value = true

  try {
    const result = await fetchCheckoutShippingRates({
      cartItems: cartItems.value,
      customer: {
        ...customer.value,
        country:
          customer.value.country === 'US'
            ? 'United States'
            : customer.value.country === 'CA'
              ? 'Canada'
              : customer.value.country,
      },
    })
    const options = Array.isArray(result?.options)
      ? result.options.map(normalizeShippingOption)
      : []

    if (options.length) {
      shippingOptions.value = options
      const stillAvailable = options.some((option) =>
        option.code === selectedShipping.value,
      )
      selectedShipping.value = stillAvailable
        ? selectedShipping.value
        : result.defaultMethod || options[0].code
      shippingRateMessage.value = result.message || ''
    }
  }
  catch (error) {
    shippingRateMessage.value = 'Carrier rates are unavailable. Store shipping rates are shown.'
    console.warn('[checkout] Shipping rate refresh failed.', error)
  }
  finally {
    isLoadingShippingRates.value = false
  }
}

function scheduleShippingRates() {
  window.clearTimeout(shippingRateTimer)
  shippingRateTimer = window.setTimeout(() => {
    loadShippingRates()
  }, 700)
}



onBeforeUnmount(() => window.clearTimeout(shippingRateTimer))
return { selectedShipping, selectedShippingOption, shippingPrice, shippingOptions, isLoadingShippingRates, shippingRateMessage, buildSelectedShippingPayload, loadShippingOptions, scheduleShippingRates }
}
