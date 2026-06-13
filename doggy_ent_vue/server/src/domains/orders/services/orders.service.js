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
  decrementProductInventory,
} from '../../products/services/products.service.js'
import { prisma } from '../../../db/prisma.js'
import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  ORDER_STATUS,
} from '../constants/orders.constants.js'
import {
  validateOrderStatus,
} from '../validators/orders.validator.js'

async function rollbackInventoryReservation({
  items = [],
}) {
  for (const item of items) {
    const quantity = Math.max(
      0,
      Number.parseInt(item.quantity || 0, 10),
    )

    if (!quantity) {
      continue
    }

    const sku = item.variant?.sku || item.sku

    if (!sku) {
      continue
    }

    await prisma.productVariant.update({
      where: {
        sku,
      },

      data: {
        inventory: {
          increment: quantity,
        },
      },
    })
  }
}

export async function fetchAdminOrders() {
  return await findAllOrders()
}

export async function fetchAdminOrderById(orderId) {
  const order = await findOrderById(orderId)

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

export async function fetchCustomerOrderByReference(reference) {
  return await findCustomerOrderByReference(reference)
}

export async function updateAdminOrderStatus(
  orderId,
  {
    status,
    note = null,
  },
) {
  const normalizedStatus = validateOrderStatus(status)
  const normalizedNote = String(note || '').trim() || null

  try {
    return await updateOrderStatusById(
      orderId,
      normalizedStatus,
      {
        note: normalizedNote,
        changedByType: 'ADMIN_ENV',
        changedBy: 'ADMIN_ENV',
      },
    )
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
  const orderNumber = `DGE-${Date.now()}`
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

  const discountAmount = normalizeCurrencyAmount(
    orderInput.discountAmount || 0,
  )

  const taxAmount = normalizeCurrencyAmount(
    orderInput.taxAmount || 0,
  )

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

  await decrementProductInventory({
    items: normalizedItems,
  })

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
      status: ORDER_STATUS.PENDING,
      subtotal,
      total,
      currency: orderInput.currency || 'usd',
      shippingAmount,
      discountAmount,
      taxAmount,
      stripePaymentIntentId,
      items: normalizedItems,
    })
  }
  catch (error) {
    try {
      await rollbackInventoryReservation({
        items: normalizedItems,
      })
    }
    catch (rollbackError) {
      console.error(
        '[orders] Failed inventory rollback.',
        rollbackError,
      )
    }

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
