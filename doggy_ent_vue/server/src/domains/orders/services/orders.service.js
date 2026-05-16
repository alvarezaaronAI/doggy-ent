
import {
  createOrder,
  findAllOrders,
  findOrderById,
  findOrderStats,
} from '../repositories/orders.repository.js'

export async function fetchAdminOrders() {
  return await findAllOrders()
}

export async function fetchAdminOrderById(orderId) {
  return await findOrderById(orderId)
}

export async function fetchAdminOrderStats() {
  return await findOrderStats()
}

export async function createNewOrder(orderInput) {
  const orderNumber = `DGE-${Date.now()}`

  const subtotal = Number(orderInput.subtotal || 0)
  const total = Number(orderInput.total || subtotal)

  const normalizedItems = Array.isArray(orderInput.items)
    ? orderInput.items.map((item) => ({
        productId: item.productId || item.id || null,
        productName: item.name || item.productName || 'Dog Treats',
        productImage: item.image || item.productImage || null,
        size: item.size || '6 oz',
        sku: item.variant?.sku || item.sku || null,
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.price || item.unitPrice || 0),
        lineTotal:
          Number(item.lineTotal || 0) ||
          Number(item.price || 0) * Number(item.quantity || 1),
      }))
    : []

  return await createOrder({
    orderNumber,
    customerName: orderInput.customerName || 'Guest Customer',
    customerEmail: orderInput.customerEmail || 'guest@example.com',
    status: 'PENDING',
    subtotal,
    total,
    currency: orderInput.currency || 'usd',
    stripePaymentIntentId: orderInput.stripePaymentIntentId || null,
    items: normalizedItems,
  })
}
