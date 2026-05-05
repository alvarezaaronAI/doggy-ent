

const orders = []

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `ORDER-${timestamp}-${random}`
}

function nowISO() {
  return new Date().toISOString()
}

function normalizeCustomer(customer = {}) {
  return {
    email: customer.email || '',
    phone: customer.phone || '',
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    address1: customer.address1 || '',
    address2: customer.address2 || '',
    city: customer.city || '',
    state: customer.state || '',
    zip: customer.zip || '',
    country: customer.country || 'US',
    notes: customer.notes || '',
    marketingOptIn: Boolean(customer.marketingOptIn),
    saveInfo: Boolean(customer.saveInfo),
  }
}

function normalizeShipping(shipping = {}) {
  return {
    method: shipping.method || 'standard',
    price: Number(shipping.price || 0),
  }
}

function normalizeOrderItems(cartItems = []) {
  return cartItems.map((item) => ({
    id: item.id,
    productId: item.productId || item.id,
    name: item.name || '',
    size: item.size || '',
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    image: item.image || '',
  }))
}

export async function createOrder({
  cartItems = [],
  customer = {},
  shipping = {},
  pricing = {},
  promo = null,
  campaigns = [],
}) {
  const order = {
    id: generateOrderId(),
    status: 'pending',
    paymentStatus: 'not_paid',
    fulfillmentStatus: 'unfulfilled',

    customer: normalizeCustomer(customer),
    shipping: normalizeShipping(shipping),
    items: normalizeOrderItems(cartItems),

    pricing: {
      subtotal: Number(pricing.subtotal || 0),
      shippingAmount: Number(pricing.shippingAmount || 0),
      discountAmount: Number(pricing.discountAmount || 0),
      donationAmount: Number(pricing.donationAmount || 0),
      tax: Number(pricing.tax || 0),
      total: Number(pricing.total || 0),
    },

    promo,
    campaigns,

    createdAt: nowISO(),
    updatedAt: nowISO(),
  }

  orders.unshift(order)
  return order
}

export async function getAllOrders() {
  return orders
}

export async function getOrderStats() {
  return orders.reduce(
    (stats, order) => {
      stats.totalOrders += 1
      stats.totalRevenue += Number(order.pricing?.total || 0)
      stats.totalDonationGenerated += Number(order.pricing?.donationAmount || 0)

      if (order.status === 'pending') stats.pendingOrders += 1
      if (order.paymentStatus === 'paid') stats.paidOrders += 1
      if (order.fulfillmentStatus === 'fulfilled') stats.fulfilledOrders += 1

      return stats
    },
    {
      totalOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      fulfilledOrders: 0,
      totalRevenue: 0,
      totalDonationGenerated: 0,
    }
  )
}

export async function getOrderById(orderId) {
  return orders.find((order) => order.id === orderId) || null
}

export async function updateOrderStatus(orderId, status) {
  const order = await getOrderById(orderId)

  if (!order) {
    const error = new Error('Order not found.')
    error.statusCode = 404
    throw error
  }

  order.status = status
  order.updatedAt = nowISO()

  return order
}

export async function updatePaymentStatus(orderId, paymentStatus) {
  const order = await getOrderById(orderId)

  if (!order) {
    const error = new Error('Order not found.')
    error.statusCode = 404
    throw error
  }

  order.paymentStatus = paymentStatus
  order.updatedAt = nowISO()

  return order
}

export async function updateFulfillmentStatus(orderId, fulfillmentStatus) {
  const order = await getOrderById(orderId)

  if (!order) {
    const error = new Error('Order not found.')
    error.statusCode = 404
    throw error
  }

  order.fulfillmentStatus = fulfillmentStatus
  order.updatedAt = nowISO()

  return order
}