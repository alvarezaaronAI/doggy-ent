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

export function mapAdminShipment(shipment) {
  const mappedShipment = mapShipment(shipment)

  if (!mappedShipment) {
    return null
  }

  return {
    ...mappedShipment,
    order: shipment.order
      ? {
          id: shipment.order.id,
          orderNumber: shipment.order.orderNumber,
          customerName: shipment.order.customerName,
          customerEmail: shipment.order.customerEmail,
          status: shipment.order.status,
          total: Number(shipment.order.total || 0),
          shippingMethod: shipment.order.shippingMethod,
          shippingCarrier: shipment.order.shippingCarrier,
          shippingService: shipment.order.shippingService,
          createdAt: shipment.order.createdAt,
          updatedAt: shipment.order.updatedAt,
        }
      : null,
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

export function mapShippoRate(rate) {
  if (!rate) {
    return null
  }

  const amount =
    rate.amount
    || rate.amount_local
    || rate.price
    || null
  const service =
    rate.servicelevel?.name
    || rate.servicelevel?.token
    || rate.service
    || rate.provider
    || 'Shipping'
  const estimatedDays =
    rate.estimated_days
    ?? null

  return {
    code: `shippo:${rate.object_id || rate.id}`,
    method: `shippo:${rate.object_id || rate.id}`,
    rateId: rate.object_id || rate.id || null,
    provider: 'SHIPPO',
    carrier: rate.provider || rate.carrier || null,
    service,
    label: [
      rate.provider || rate.carrier,
      service,
    ].filter(Boolean).join(' - ') || 'Carrier shipping',
    description:
      estimatedDays && Number.isFinite(Number(estimatedDays))
        ? `Estimated arrival in ${estimatedDays} business days.`
        : rate.duration_terms || 'Carrier-calculated shipping rate.',
    price: Number(amount || 0),
    currency: String(rate.currency || rate.currency_local || 'USD').toUpperCase(),
  }
}
