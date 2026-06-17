import { prisma } from '../../../db/prisma.js'
import {
  mapShipment,
} from '../mappers/shipping.mapper.js'

const SHIPMENT_INCLUDE = {
  events: {
    orderBy: {
      occurredAt: 'desc',
    },
  },
}

export async function findShipmentById(shipmentId) {
  return mapShipment(
    await prisma.orderShipment.findUnique({
      where: {
        id: shipmentId,
      },
      include: SHIPMENT_INCLUDE,
    }),
  )
}

export async function findShipmentByTracking({
  orderId,
  trackingNumber,
}) {
  return prisma.orderShipment.findUnique({
    where: {
      orderId_trackingNumber: {
        orderId,
        trackingNumber,
      },
    },
    include: SHIPMENT_INCLUDE,
  })
}

export async function upsertShipmentForOrder({
  orderId,
  carrier,
  trackingNumber,
  trackingUrl = null,
  shipmentStatus = 'UNKNOWN',
  estimatedDelivery = null,
  shippedAt = null,
  deliveredAt = null,
  source = 'ADMIN',
  rawStatus = null,
  events = [],
}) {
  const shipment = await prisma.orderShipment.upsert({
    where: {
      orderId_trackingNumber: {
        orderId,
        trackingNumber,
      },
    },
    create: {
      orderId,
      carrier,
      trackingNumber,
      trackingUrl,
      shipmentStatus,
      estimatedDelivery,
      shippedAt,
      deliveredAt,
      source,
      rawStatus,
      lastSyncedAt: rawStatus ? new Date() : null,
    },
    update: {
      carrier,
      trackingUrl,
      shipmentStatus,
      estimatedDelivery,
      shippedAt,
      deliveredAt,
      source,
      rawStatus,
      lastSyncedAt: rawStatus ? new Date() : undefined,
    },
    include: SHIPMENT_INCLUDE,
  })

  if (events.length) {
    await prisma.orderShipmentEvent.createMany({
      data: events.map((event) => ({
        shipmentId: shipment.id,
        status: event.status,
        message: event.message || null,
        location: event.location || null,
        occurredAt: event.occurredAt || null,
        rawEvent: event.rawEvent || null,
      })),
      skipDuplicates: true,
    })
  }

  return mapShipment(
    await prisma.orderShipment.findUnique({
      where: {
        id: shipment.id,
      },
      include: SHIPMENT_INCLUDE,
    }),
  )
}

export async function findAdminShipments({
  status = null,
  limit = 75,
} = {}) {
  return prisma.orderShipment.findMany({
    where: {
      ...(status ? { shipmentStatus: status } : {}),
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: Math.min(Math.max(Number(limit) || 75, 1), 150),
    include: {
      ...SHIPMENT_INCLUDE,
      order: {
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          status: true,
          total: true,
          shippingMethod: true,
          shippingCarrier: true,
          shippingService: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })
}
