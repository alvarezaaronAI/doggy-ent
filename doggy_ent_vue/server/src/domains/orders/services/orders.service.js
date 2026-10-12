import {
  createOrder,
  findAllOrders,
  findCustomerOrderByReference,
  findOrderById,
  findOrderByStripePaymentIntentId,
  findOrderStats,
  findOrdersByCustomerEmail,
  updateOrderStatusById,
} from '../repositories/orders.repository.js'
import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  ORDER_STATUS,
} from '../constants/orders.constants.js'
import {
  validateOrderStatus,
} from '../validators/orders.validator.js'
import { randomBytes } from 'node:crypto'

export async function fetchAdminOrders() {
  return await findAllOrders()
}

export async function fetchAdminOrderById(orderId) {
  const order = await findOrderById(orderId, { includeAdminRecord: true })

  if (!order?.customerEmail) {
    return order
  }

  const sameCustomerOrders = await findOrdersByCustomerEmail(
    order.customerEmail,
    order.id,
  )

  return {
    ...order,
    sameCustomerOrders,
  }
}

export async function fetchAdminOrderStats() {
  return await findOrderStats()
}

export async function fetchCustomerOrderByReference(reference, ownership = {}) {
  return await findCustomerOrderByReference(reference, ownership)
}

export async function updateAdminOrderStatus(
  orderId,
  {
    status,
    note = null,
  },
  actor,
) {
  const normalizedStatus = validateOrderStatus(status)
  const normalizedNote = String(note || '').trim() || null

  try {
    const order = await updateOrderStatusById(
      orderId,
      normalizedStatus,
      {
        note: normalizedNote,
        changedByType: actor?.id ? 'ADMIN' : 'SYSTEM',
        changedBy: actor?.id || null,
      },
    )


    return order
  }
  catch (error) {
    if (error.code === 'P2025') {
      const notFound = new Error('Order not found.')
      notFound.statusCode = 404
      throw notFound
    }

    throw error
  }
}


export async function createNewOrder(orderInput) {
  const orderNumber = `DGE-${Date.now()}-${randomBytes(6).toString('hex').toUpperCase()}`
  const stripePaymentIntentId =
    orderInput.stripePaymentIntentId || null

  const existingOrder =
    await findOrderByStripePaymentIntentId(
      stripePaymentIntentId,
    )

  if (existingOrder) {
    return existingOrder
  }

  const subtotal = normalizeCurrencyAmount(
    orderInput.subtotal || 0,
  )

  const total = normalizeCurrencyAmount(
    orderInput.total || subtotal,
  )

  const shippingAmount = normalizeCurrencyAmount(
    orderInput.shippingAmount || 0,
  )
  const shippingMethod = String(
    orderInput.shippingMethod || '',
  ).trim() || null

  const discountAmount = normalizeCurrencyAmount(
    orderInput.discountAmount || 0,
  )

  const taxAmount = normalizeCurrencyAmount(
    orderInput.taxAmount || 0,
  )

  const normalizedItems = Array.isArray(orderInput.items)
    ? orderInput.items.map((item) => ({
        productId: item.productId || item.id || null,
        productName: item.name || item.productName || 'Dog Treats',
        productImage: item.image || item.productImage || null,
        size: item.size || '6 oz',
        sku: item.variant?.sku || item.sku || null,
        quantity: Number(item.quantity || 1),
        unitPrice: normalizeCurrencyAmount(
          item.price || item.unitPrice || 0,
        ),
        lineTotal: normalizeCurrencyAmount(
          Number(item.lineTotal || 0)
          || Number(item.price || 0)
            * Number(item.quantity || 1),
        ),
      }))
    : []

  try {
    return await createOrder({
      orderNumber,
      userId: orderInput.userId || null,
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
      status: ORDER_STATUS.PAID,
      subtotal,
      total,
      currency: orderInput.currency || 'usd',
      shippingMethod,
      shippingCarrier: orderInput.shippingCarrier,
      shippingService: orderInput.shippingService,
      shippingRateId: orderInput.shippingRateId,
      shippingRateProvider: orderInput.shippingRateProvider,
      shippingAmount,
      discountAmount,
      taxAmount,
      stripePaymentIntentId,
      items: normalizedItems,
    })
  }
  catch (error) {
    if (
      error.code === 'P2002'
      && stripePaymentIntentId
    ) {
      const existingOrderAfterConflict =
        await findOrderByStripePaymentIntentId(
          stripePaymentIntentId,
        )

      if (existingOrderAfterConflict) {
        return existingOrderAfterConflict
      }
    }

    throw error
  }
}

export async function resendAdminOrderEmail() {
  throw Object.assign(new Error('Use the template preview and explicit send workflow.'), { statusCode: 410 })
}
