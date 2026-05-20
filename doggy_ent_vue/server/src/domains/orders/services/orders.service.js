import {
  createOrder,
  findAllOrders,
  findOrderById,
  findOrderByStripePaymentIntentId,
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
  const shippingAmount = Number(orderInput.shippingAmount || 0)
  const discountAmount = Number(orderInput.discountAmount || 0)
  const taxAmount = Number(orderInput.taxAmount || 0)

  // TEMPORARY: disable idempotency return while tracing checkout flow.
  // We discovered earlier incomplete orders are being reused,
  // which causes Guest Customer + subtotal-only snapshots.
  // We want to force creation of the finalized checkout payload
  // until the upstream duplicate request source is fully isolated.

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
    status: 'PENDING',
    subtotal,
    total,
    currency: orderInput.currency || 'usd',
    shippingAmount,
    discountAmount,
    taxAmount,
    stripePaymentIntentId: orderInput.stripePaymentIntentId || null,
    items: normalizedItems,
  })
}
