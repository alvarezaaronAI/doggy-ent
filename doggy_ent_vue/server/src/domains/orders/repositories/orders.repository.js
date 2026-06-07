import { prisma } from '../../../db/prisma.js'
import {
  getOrderDonationAmount,
  mapCustomerOrder,
  mapOrder,
} from '../mappers/orders.mapper.js'
import {
  ORDER_STATUS,
} from '../constants/orders.constants.js'

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
    },
  })

  return orders.map(mapOrder)
}

export async function findOrderById(orderId) {
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

  return mapOrder(order ? { ...order, promoUsage } : null)
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
    },
  })

  return mapOrder(order)
}

export async function findCustomerOrderByReference(reference) {
  const normalizedReference = String(reference || '').trim()

  if (!normalizedReference) {
    return null
  }

  const order = await prisma.order.findFirst({
    where: {
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

  return mapCustomerOrder(order ? { ...order, promoUsage } : null)
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

export async function createOrder(orderInput) {
  const createdOrder = await prisma.order.create({
    data: {
      orderNumber: orderInput.orderNumber,
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
      shippingAmount: Number(orderInput.shippingAmount || 0),
      discountAmount: Number(orderInput.discountAmount || 0),
      taxAmount: Number(orderInput.taxAmount || 0),
      currency: orderInput.currency || 'usd',
      stripePaymentIntentId:
        orderInput.stripePaymentIntentId || null,
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
    },
  })

  return mapOrder(createdOrder)
}

export async function updateOrderStatusById(
  orderId,
  status,
  {
    note = null,
    changedByType = 'ADMIN_ENV',
    changedBy = 'ADMIN_ENV',
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
      },
    })
  })

  return mapOrder(updatedOrder)
}
