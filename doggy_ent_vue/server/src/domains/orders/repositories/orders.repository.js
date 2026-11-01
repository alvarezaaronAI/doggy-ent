import { prisma } from '../../../db/prisma.js'
import { mapAdminOrderRecord } from '../mappers/adminOrderRecord.mapper.js'
import {
  getOrderDonationAmount,
  mapCustomerOrder,
  mapOrder,
} from '../mappers/orders.mapper.js'
import {
  ORDER_STATUS,
} from '../constants/orders.constants.js'

const orderShipmentsInclude = {
  orderBy: {
    createdAt: 'desc',
  },
  include: {
    events: {
      orderBy: {
        occurredAt: 'desc',
      },
    },
  },
}

const orderEmailDeliveriesInclude = {
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
}

export async function findAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      shipments: orderShipmentsInclude,
      emailDeliveries: orderEmailDeliveriesInclude,
    },
  })

  return orders.map(mapOrder)
}

export async function findOrderById(orderId, { includeAdminRecord = false } = {}) {
  const [order, promoUsage] = await Promise.all([
    prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
        campaignUsages: {
          include: {
            campaign: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        shipments: orderShipmentsInclude,
        emailDeliveries: orderEmailDeliveriesInclude,
        ...(includeAdminRecord ? { supportRequests: { orderBy: { createdAt: 'desc' } } } : {}),
      },
    }),
    prisma.promoUsage.findFirst({
      where: {
        orderId,
      },
      include: {
        promo: true,
      },
    }),
  ])

  const mappedOrder = mapOrder(order ? { ...order, promoUsage } : null)
  if (mappedOrder && includeAdminRecord) {
    mappedOrder.internalRecord = mapAdminOrderRecord({ ...order, promoUsage })
  }
  return mappedOrder
}

export async function findOrderByStripePaymentIntentId(stripePaymentIntentId) {
  if (!stripePaymentIntentId) {
    return null
  }

  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId,
    },
    include: {
      items: true,
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      shipments: orderShipmentsInclude,
      emailDeliveries: orderEmailDeliveriesInclude,
    },
  })

  return mapOrder(order)
}

export async function findCustomerOrderByReference(reference, { userId = null, viewerId = null } = {}) {
  const normalizedReference = String(reference || '').trim()

  if (!normalizedReference) {
    return null
  }

  const order = await prisma.order.findFirst({
    where: {
      ...(userId ? { userId } : {}),
      OR: [
        {
          orderNumber: normalizedReference,
        },
        {
          id: normalizedReference,
        },
      ],
    },
    include: {
      items: true,
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      shipments: orderShipmentsInclude,
      emailDeliveries: orderEmailDeliveriesInclude,
    },
  })

  const promoUsage = order
    ? await prisma.promoUsage.findFirst({
        where: {
          orderId: order.id,
        },
        include: {
          promo: true,
        },
      })
    : null

  const mapped = mapCustomerOrder(order ? { ...order, promoUsage } : null)
  return mapped ? { ...mapped, accountLinked: Boolean(viewerId && order.userId === viewerId) } : null
}

export async function findOrdersByCustomerEmail(
  customerEmail,
  excludeOrderId = null,
) {
  const normalizedEmail = String(customerEmail || '').trim()

  if (!normalizedEmail) {
    return []
  }

  const orders = await prisma.order.findMany({
    where: {
      customerEmail: normalizedEmail,
      ...(excludeOrderId
        ? {
            id: {
              not: excludeOrderId,
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    include: {
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      shipments: orderShipmentsInclude,
      emailDeliveries: orderEmailDeliveriesInclude,
    },
  })

  return orders.map(mapOrder)
}

export async function findOrderStats() {
  const orders = await prisma.order.findMany({
    include: {
      campaignUsages: true,
    },
  })

  const totalOrders = orders.length

  const pendingOrders = orders.filter(
    (order) => order.status === ORDER_STATUS.PENDING
  ).length

  const paidOrders = orders.filter(
    (order) => order.status === ORDER_STATUS.PAID
  ).length

  const shippedOrders = orders.filter(
    (order) => order.status === ORDER_STATUS.SHIPPED
  ).length

  const deliveredOrders = orders.filter(
    (order) => order.status === ORDER_STATUS.DELIVERED
  ).length

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.total || 0)
  }, 0)

  const totalDonationGenerated = orders.reduce((sum, order) => {
    return sum + getOrderDonationAmount(order)
  }, 0)

  return {
    totalOrders,
    pendingOrders,
    paidOrders,
    shippedOrders,
    deliveredOrders,
    fulfilledOrders: deliveredOrders,
    totalRevenue,
    totalDonationGenerated,
  }
}

export async function createOrderTx(tx, orderInput) {
  const unavailable = () => Object.assign(new Error('An ordered variant is no longer available.'), { statusCode: 409, code: 'CHECKOUT_VARIANT_UNAVAILABLE' })
  const quantities = new Map()
  for (const item of orderInput.items) {
    if (!item.sku || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw unavailable()
    const existing = quantities.get(item.sku)
    if (existing && ['productId', 'variantId', 'size'].some(key => existing[key] && item[key] && existing[key] !== item[key])) throw unavailable()
    const quantity = (existing?.quantity || 0) + item.quantity
    if (!Number.isSafeInteger(quantity) || quantity > 2147483647) throw unavailable()
    quantities.set(item.sku, { ...existing, ...item, productId: item.productId || existing?.productId, size: item.size || existing?.size, variantId: item.variantId || existing?.variantId, quantity })
  }
  // Stable ordering avoids opposite stock-lock order for overlapping bags.
  for (const item of [...quantities.values()].sort((a, b) => a.sku.localeCompare(b.sku))) {
    const variant = await tx.productVariant.findUnique({ where: item.variantId ? { id: item.variantId } : { sku: item.sku }, include: { product: true } })
    if (!variant || !variant.isActive || variant.product.status !== 'ACTIVE' || variant.product.isTestProduct
      || variant.sku !== item.sku || (item.productId && variant.productId !== item.productId)
      || (item.size && variant.size !== item.size)) throw unavailable()
    if (variant.product.sellingMode && variant.product.sellingMode !== 'INVENTORY_LIMITED') continue
    const reserved = await tx.productVariant.updateMany({
      where: { id: variant.id, productId: variant.productId, sku: item.sku, isActive: true, inventory: { gte: item.quantity } },
      data: { inventory: { decrement: item.quantity } },
    })
    if (reserved.count !== 1) throw Object.assign(new Error('An ordered variant no longer has enough stock. Payment may be complete; contact support rather than paying again.'), { statusCode: 409, code: 'CHECKOUT_STOCK_UNAVAILABLE' })
  }
  return tx.order.create({
    data: {
      orderNumber: orderInput.orderNumber,
      userId: orderInput.userId || null,
      customerName: orderInput.customerName,
      customerEmail: orderInput.customerEmail,
      customerPhone: orderInput.customerPhone || null,
      deliveryNotes: orderInput.deliveryNotes || null,
      address1: orderInput.address1 || null,
      address2: orderInput.address2 || null,
      city: orderInput.city || null,
      state: orderInput.state || null,
      zip: orderInput.zip || null,
      country: orderInput.country || null,
      marketingOptIn: Boolean(orderInput.marketingOptIn),
      saveInfo: Boolean(orderInput.saveInfo),
      status: orderInput.status || 'PENDING',
      total: Number(orderInput.total || 0),
      subtotal: Number(orderInput.subtotal || 0),
      shippingMethod: orderInput.shippingMethod || null,
      shippingCarrier: orderInput.shippingCarrier || null,
      shippingService: orderInput.shippingService || null,
      shippingRateId: orderInput.shippingRateId || null,
      shippingRateProvider: orderInput.shippingRateProvider || null,
      shippingAmount: Number(orderInput.shippingAmount || 0),
      discountAmount: Number(orderInput.discountAmount || 0),
      taxAmount: Number(orderInput.taxAmount || 0),
      ...(orderInput.taxSnapshot ? { taxSnapshot: orderInput.taxSnapshot } : {}),
      ...(orderInput.attributionSnapshot ? { attributionSnapshot: orderInput.attributionSnapshot } : {}),
      currency: orderInput.currency || 'usd',
      stripePaymentIntentId:
        orderInput.stripePaymentIntentId || null,
      ...(orderInput.receiptDelivery ? {
        emailDeliveries: { create: orderInput.receiptDelivery },
      } : {}),
      items: {
        create: orderInput.items.map((item) => ({
          productId: item.productId || null,
          productName: item.productName,
          productImage: item.productImage || null,
          size: item.size,
          sku: item.sku || null,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0),
        })),
      },
    },
    include: {
      items: true,
      campaignUsages: {
        include: {
          campaign: true,
        },
      },
      shipments: orderShipmentsInclude,
      emailDeliveries: orderEmailDeliveriesInclude,
    },
  })
}

export async function createOrder(orderInput) {
  const createdOrder = await prisma.$transaction(tx => createOrderTx(tx, orderInput))
  return mapOrder(createdOrder)
}

export async function updateOrderStatusById(
  orderId,
  status,
  {
    note = null,
    changedByType = 'SYSTEM',
    changedBy = null,
    allowedFromStatuses = null,
  } = {},
) {
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: {
        id: orderId,
      },
    })

    if (!existingOrder) {
      const error = new Error('Order not found.')
      error.code = 'P2025'
      throw error
    }

    if (allowedFromStatuses && !allowedFromStatuses.includes(existingOrder.status)) return existingOrder

    if (existingOrder.status !== status) {
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: existingOrder.status,
          toStatus: status,
          note,
          changedByType,
          changedBy,
        },
      })
    }

    return tx.order.update({
      where: {
        id: orderId,
        status: existingOrder.status,
      },
      data: {
        status,
      },
      include: {
        items: true,
        campaignUsages: {
          include: {
            campaign: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        shipments: orderShipmentsInclude,
        emailDeliveries: orderEmailDeliveriesInclude,
      },
    }).catch(error => {
      if (error.code === 'P2025') throw Object.assign(new Error('This order changed during the update. Reload it before saving again.'), { statusCode: 409 })
      throw error
    })
  })

  return mapOrder(updatedOrder)
}
