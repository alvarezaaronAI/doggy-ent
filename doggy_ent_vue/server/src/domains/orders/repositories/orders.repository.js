import { prisma } from '../../../db/prisma.js'

export async function findAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return orders
}

export async function findOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  })

  return order
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
    },
  })

  return order
}

export async function findOrderStats() {
  const orders = await prisma.order.findMany()

  const totalOrders = orders.length

  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING'
  ).length

  const shippedOrders = orders.filter(
    (order) => order.status === 'SHIPPED'
  ).length

  const deliveredOrders = orders.filter(
    (order) => order.status === 'DELIVERED'
  ).length

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.total || 0)
  }, 0)

  return {
    totalOrders,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    totalRevenue,
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
      stripePaymentIntentId: orderInput.stripePaymentIntentId || null,
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
    },
  })

  return createdOrder
}
