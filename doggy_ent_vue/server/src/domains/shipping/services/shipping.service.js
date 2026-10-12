import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'
import {
  ORDER_STATUS,
} from '../../orders/constants/orders.constants.js'
import {
  findOrderById,
  updateOrderStatusById,
} from '../../orders/repositories/orders.repository.js'
import {
  fetchShippoTrackingStatus,
  isShippoConfigured,
} from './shippo.service.js'
import {
  upsertShipmentForOrder,
  findAdminShipments,
} from '../repositories/shipping.repository.js'
import {
  mapAdminShipment,
} from '../mappers/shipping.mapper.js'
import {
  validateTrackingPayload,
} from '../validators/shipping.validator.js'

function statusFromShipmentStatus(status) {
  const normalized = String(status || '').toUpperCase()

  if (normalized === 'DELIVERED') {
    return ORDER_STATUS.DELIVERED
  }

  if ([
    'TRANSIT',
    'SHIPPED',
    'PRE_TRANSIT',
    'OUT_FOR_DELIVERY',
  ].includes(normalized)) {
    return ORDER_STATUS.SHIPPED
  }

  return null
}


export async function addOrUpdateOrderTracking(
  orderId,
  payload = {},
  actor,
) {
  const order = await findOrderById(orderId)

  if (!order) {
    const error = new Error('Order not found.')
    error.statusCode = 404
    throw error
  }

  const tracking = validateTrackingPayload(payload)
  let shipmentInput = {
    ...tracking,
    orderId,
    source: isShippoConfigured() ? 'SHIPPO' : 'ADMIN',
  }

  try {
    const shippoResult = await fetchShippoTrackingStatus(tracking)

    if (shippoResult.tracking) {
      shipmentInput = {
        ...shipmentInput,
        ...shippoResult.tracking,
        orderId,
        source: 'SHIPPO',
      }
    }
  }
  catch (error) {
    logOperationalFailure('SHIPPO_TRACKING_FAILED', error)
  }

  const shipment = await upsertShipmentForOrder(shipmentInput)
  const nextOrderStatus =
    statusFromShipmentStatus(shipment.shipmentStatus)
    || (payload.markShipped ? ORDER_STATUS.SHIPPED : null)

  let updatedOrder = await findOrderById(orderId)

  if (
    nextOrderStatus
    && updatedOrder.status !== nextOrderStatus
  ) {
    updatedOrder = await updateOrderStatusById(
      orderId,
      nextOrderStatus,
      {
        note: `Tracking ${shipment.trackingNumber} marked ${nextOrderStatus}.`,
        changedByType: actor?.id ? 'ADMIN' : 'SYSTEM',
        changedBy: actor?.id || null,
        allowedFromStatuses: nextOrderStatus === ORDER_STATUS.DELIVERED ? ['PAID', 'PROCESSING', 'SHIPPED'] : ['PAID', 'PROCESSING'],
      },
    )
  }


  return {
    order: await findOrderById(orderId),
    shipment,
  }
}

export async function refreshOrderTracking(orderId, actor) {
  const order = await findOrderById(orderId)
  const shipment = order?.shipments?.[0]

  if (!order || !shipment) {
    const error = new Error('Shipment not found.')
    error.statusCode = 404
    throw error
  }

  return addOrUpdateOrderTracking(orderId, {
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    trackingUrl: shipment.trackingUrl,
  }, actor)
}

export async function fetchAdminShipmentOverview({
  status = null,
  limit = 75,
} = {}) {
  const shipments = await findAdminShipments({
    status: status ? String(status).trim().toUpperCase() : null,
    limit,
  })

  const mappedShipments = shipments
    .map(mapAdminShipment)
    .filter(Boolean)

  return {
    providerConfigured: isShippoConfigured(),
    total: mappedShipments.length,
    shipped: mappedShipments.filter((shipment) =>
      ['SHIPPED', 'TRANSIT', 'PRE_TRANSIT', 'OUT_FOR_DELIVERY'].includes(
        String(shipment.shipmentStatus || '').toUpperCase(),
      ),
    ).length,
    delivered: mappedShipments.filter((shipment) =>
      String(shipment.shipmentStatus || '').toUpperCase() === 'DELIVERED',
    ).length,
    failed: mappedShipments.filter((shipment) =>
      ['FAILURE', 'ERROR', 'RETURNED'].includes(
        String(shipment.shipmentStatus || '').toUpperCase(),
      ),
    ).length,
    recent: mappedShipments,
  }
}
