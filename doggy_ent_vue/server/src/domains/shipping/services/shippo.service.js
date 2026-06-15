import {
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
