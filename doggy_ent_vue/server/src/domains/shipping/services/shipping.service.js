import {
  ORDER_STATUS,
} from '../../orders/constants/orders.constants.js'
import {
  findOrderById,
  updateOrderStatusById,
} from '../../orders/repositories/orders.repository.js'
import {
  buildOrderEmailPayload,
} from '../../emails/mappers/emailPayloads.mapper.js'
import {
  EMAIL_EVENTS,
} from '../../emails/constants/emailEvents.constants.js'
import {
  queueEmail,
} from '../../emails/services/emailProvider.service.js'
import {
  fetchShippoTrackingStatus,
  isShippoConfigured,
} from './shippo.service.js'
import {
  upsertShipmentForOrder,
} from '../repositories/shipping.repository.js'
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

function getTrackingEmailEvent(orderStatus) {
  if (orderStatus === ORDER_STATUS.DELIVERED) {
    return EMAIL_EVENTS.ORDER_DELIVERED
  }

  if (orderStatus === ORDER_STATUS.SHIPPED) {
    return EMAIL_EVENTS.ORDER_SHIPPED
  }

  return EMAIL_EVENTS.TRACKING_UPDATE
}

async function queueTrackingEmail({
  order,
  shipment,
  event,
}) {
  if (!order?.customerEmail) {
    return null
  }

  return queueEmail(
    buildOrderEmailPayload({
      event,
      order,
      tracking: shipment,
    }),
  )
}

export async function addOrUpdateOrderTracking(
  orderId,
  payload = {},
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
    console.error(
      '[shipping] Shippo tracking sync failed:',
      error.safeMessage || error.message,
    )
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
        changedByType: 'ADMIN_ENV',
        changedBy: 'ADMIN_ENV',
      },
    )
  }

  await queueTrackingEmail({
    order: updatedOrder,
    shipment,
    event: getTrackingEmailEvent(
      nextOrderStatus || updatedOrder.status,
    ),
  })

  return {
    order: await findOrderById(orderId),
    shipment,
  }
}

export async function refreshOrderTracking(orderId) {
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
  })
}
