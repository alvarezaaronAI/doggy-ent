const TRACKING_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9\s-]{3,80}$/

export function normalizeCarrier(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function normalizeTrackingNumber(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
}

export function validateTrackingPayload(payload = {}) {
  const carrier = normalizeCarrier(payload.carrier)
  const trackingNumber = normalizeTrackingNumber(payload.trackingNumber)

  if (!carrier) {
    const error = new Error('Carrier is required.')
    error.statusCode = 400
    throw error
  }

  if (
    !trackingNumber
    || !TRACKING_PATTERN.test(trackingNumber)
  ) {
    const error = new Error('A valid tracking number is required.')
    error.statusCode = 400
    throw error
  }

  return {
    carrier,
    trackingNumber,
    trackingUrl: String(payload.trackingUrl || '').trim() || null,
    shipmentStatus:
      String(payload.shipmentStatus || 'UNKNOWN')
        .trim()
        .toUpperCase()
      || 'UNKNOWN',
  }
}
