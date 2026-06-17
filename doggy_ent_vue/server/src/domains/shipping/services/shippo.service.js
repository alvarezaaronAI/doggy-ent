import {
  mapShippoRate,
  mapShippoTrackingResponse,
} from '../mappers/shipping.mapper.js'

function getShippoApiKey() {
  return String(
    process.env.SHIPPO_API_KEY
    || process.env.SHIPPO_API_TOKEN
    || '',
  ).trim()
}

function sanitizeShippoError(error) {
  return String(error?.message || error || 'Shippo provider error.')
    .replace(getShippoApiKey(), '[redacted]')
    .slice(0, 500)
}

export function isShippoConfigured() {
  return Boolean(getShippoApiKey())
}

export async function fetchShippoTrackingStatus({
  carrier,
  trackingNumber,
  trackingUrl = null,
}) {
  if (!isShippoConfigured()) {
    return {
      configured: false,
      tracking: null,
    }
  }

  const response = await fetch(
    `https://api.goshippo.com/tracks/${encodeURIComponent(carrier)}/${encodeURIComponent(trackingNumber)}`,
    {
      headers: {
        Authorization: `ShippoToken ${getShippoApiKey()}`,
      },
    },
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      data?.detail
      || data?.message
      || `Shippo returned ${response.status}.`,
    )
    error.statusCode = response.status
    error.safeMessage = sanitizeShippoError(error)
    throw error
  }

  return {
    configured: true,
    tracking: mapShippoTrackingResponse({
      carrier,
      trackingNumber,
      trackingUrl,
      data,
    }),
  }
}

function getRequiredFromAddress() {
  const address = {
    name: process.env.SHIPPO_FROM_NAME,
    street1: process.env.SHIPPO_FROM_STREET1,
    street2: process.env.SHIPPO_FROM_STREET2,
    city: process.env.SHIPPO_FROM_CITY,
    state: process.env.SHIPPO_FROM_STATE,
    zip: process.env.SHIPPO_FROM_ZIP,
    country: process.env.SHIPPO_FROM_COUNTRY || 'US',
    phone: process.env.SHIPPO_FROM_PHONE,
    email: process.env.SHIPPO_FROM_EMAIL,
  }

  const required = [
    'name',
    'street1',
    'city',
    'state',
    'zip',
    'country',
  ]

  if (required.some((key) => !String(address[key] || '').trim())) {
    return null
  }

  return Object.fromEntries(
    Object.entries(address)
      .filter(([, value]) => String(value || '').trim())
      .map(([key, value]) => [key, String(value).trim()]),
  )
}

function getDefaultParcel(cartItems = []) {
  const itemCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  )

  return {
    length: process.env.SHIPPO_PARCEL_LENGTH || '8',
    width: process.env.SHIPPO_PARCEL_WIDTH || '6',
    height: process.env.SHIPPO_PARCEL_HEIGHT || '3',
    distance_unit: process.env.SHIPPO_PARCEL_DISTANCE_UNIT || 'in',
    weight: String(
      Number(process.env.SHIPPO_PARCEL_WEIGHT || 1)
      + Math.max(itemCount - 1, 0) * 0.25,
    ),
    mass_unit: process.env.SHIPPO_PARCEL_MASS_UNIT || 'lb',
  }
}

function normalizeCountry(country) {
  const value = String(country || 'US').trim()
  if (value === 'United States') return 'US'
  if (value === 'Canada') return 'CA'
  return value || 'US'
}

function buildShippoAddressTo(customer = {}) {
  return {
    name: [
      customer.firstName,
      customer.lastName,
    ].filter(Boolean).join(' ') || customer.name || 'Customer',
    street1: customer.address1,
    street2: customer.address2 || undefined,
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
    country: normalizeCountry(customer.country),
    phone: customer.phone || undefined,
    email: customer.email || undefined,
  }
}

export function canFetchShippoRates() {
  return isShippoConfigured() && Boolean(getRequiredFromAddress())
}

export async function fetchShippoRates({
  customer = {},
  cartItems = [],
} = {}) {
  const addressFrom = getRequiredFromAddress()

  if (!isShippoConfigured() || !addressFrom) {
    return {
      configured: isShippoConfigured(),
      rates: [],
    }
  }

  const response = await fetch('https://api.goshippo.com/shipments/', {
    method: 'POST',
    headers: {
      Authorization: `ShippoToken ${getShippoApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address_from: addressFrom,
      address_to: buildShippoAddressTo(customer),
      parcels: [getDefaultParcel(cartItems)],
      async: false,
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      data?.detail
      || data?.message
      || `Shippo returned ${response.status}.`,
    )
    error.statusCode = response.status
    error.safeMessage = sanitizeShippoError(error)
    throw error
  }

  const rawRates = Array.isArray(data?.rates)
    ? data.rates
    : []

  return {
    configured: true,
    rates: rawRates
      .map(mapShippoRate)
      .filter((rate) => rate && rate.rateId && rate.price >= 0),
  }
}
