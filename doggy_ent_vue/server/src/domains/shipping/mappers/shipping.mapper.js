function parseDate(value) {
  return value ? new Date(value) : null
}

function getShippoTrackingUrl({
  trackingUrl,
}) {
  if (trackingUrl) {
    return trackingUrl
  }
  return null
}

export function mapShipmentEvent(event) {
  if (!event) {
    return null
  }

  return {
    id: event.id,
    status: event.status,
    message: event.message,
    location: event.location,
    occurredAt: event.occurredAt,
    createdAt: event.createdAt,
  }
}

export function mapShipment(shipment) {
  if (!shipment) {
    return null
  }

  return {
    id: shipment.id,
    orderId: shipment.orderId,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    trackingUrl: shipment.trackingUrl,
    shipmentStatus: shipment.shipmentStatus,
    estimatedDelivery: shipment.estimatedDelivery,
    shippedAt: shipment.shippedAt,
    deliveredAt: shipment.deliveredAt,
    lastSyncedAt: shipment.lastSyncedAt,
    source: shipment.source,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
    events: Array.isArray(shipment.events)
      ? shipment.events.map(mapShipmentEvent).filter(Boolean)
      : [],
  }
}

export function mapShippoTrackingResponse({
  carrier,
  trackingNumber,
  trackingUrl = null,
  data = {},
}) {
  const status = data.tracking_status || data.status || {}
  const history = Array.isArray(data.tracking_history)
    ? data.tracking_history
    : []
  const statusCode =
    status.status
    || data.tracking_status?.status
    || data.status
    || 'UNKNOWN'
  const estimatedDelivery =
    data.eta
    || data.estimated_delivery_date
    || status.eta
    || null

  return {
    carrier,
    trackingNumber,
    trackingUrl: getShippoTrackingUrl({
      trackingUrl: data.tracking_url_provider || trackingUrl,
    }),
    shipmentStatus: String(statusCode || 'UNKNOWN').toUpperCase(),
    estimatedDelivery: parseDate(estimatedDelivery),
    shippedAt: null,
    deliveredAt:
      String(statusCode || '').toUpperCase() === 'DELIVERED'
        ? parseDate(status.status_date || new Date())
        : null,
    rawStatus: data,
    events: history.map((event) => ({
      status: String(event.status || 'UNKNOWN').toUpperCase(),
      message: event.status_details || event.message || null,
      location: [
        event.location?.city,
        event.location?.state,
        event.location?.zip,
        event.location?.country,
      ]
        .filter(Boolean)
        .join(', ') || null,
      occurredAt: parseDate(event.status_date),
      rawEvent: event,
    })),
  }
}
