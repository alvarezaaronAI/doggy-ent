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
      status: orderInput.status || 'PENDING',
      total: Number(orderInput.total || 0),
      subtotal: Number(orderInput.subtotal || 0),
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
