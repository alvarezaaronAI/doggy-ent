import {
  EMAIL_EVENTS,
} from '../constants/emailEvents.constants.js'

function getFrontendOrigin() {
  return String(
    process.env.FRONTEND_URL
    || process.env.CLIENT_URL
    || 'http://localhost:5173',
  )
    .split(',')[0]
    .trim()
    .replace(/\/$/, '')
}

function mapOrderItem(item) {
  return {
    productName: item.productName,
    size: item.size,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    lineTotal: Number(item.lineTotal || 0),
  }
}

export function buildAccountVerificationEmail({
  user,
  url,
  event = EMAIL_EVENTS.ACCOUNT_VERIFICATION,
}) {
  return {
    event,
    to: user.email,
    userId: user.id,
    customerName: user.name,
    actionUrl: url,
    dedupeKey: `${event}:${user.id || user.email}`,
  }
}

export function buildPasswordResetEmail({
  user,
  url,
}) {
  return {
    event: EMAIL_EVENTS.PASSWORD_RESET,
    to: user.email,
    userId: user.id,
    customerName: user.name,
    actionUrl: url,
    dedupeKey: `${EMAIL_EVENTS.PASSWORD_RESET}:${user.id || user.email}:${Date.now()}`,
  }
}

export function buildWelcomeEmail(user) {
  return {
    event: EMAIL_EVENTS.WELCOME,
    to: user.email,
    userId: user.id,
    customerName: user.name,
    actionUrl: `${getFrontendOrigin()}/account`,
    dedupeKey: `${EMAIL_EVENTS.WELCOME}:${user.id || user.email}`,
  }
}

export function buildAccountCreatedEmail(user) {
  return {
    event: EMAIL_EVENTS.ACCOUNT_CREATED,
    to: user.email,
    userId: user.id,
    customerName: user.name,
    actionUrl: `${getFrontendOrigin()}/account`,
    dedupeKey: `${EMAIL_EVENTS.ACCOUNT_CREATED}:${user.id || user.email}`,
  }
}

export function buildProfileUpdatedEmail({
  user,
}) {
  return {
    event: EMAIL_EVENTS.PROFILE_UPDATED,
    to: user.email,
    userId: user.id,
    customerName: user.name,
    actionUrl: `${getFrontendOrigin()}/account/profile`,
    dedupeKey: `${EMAIL_EVENTS.PROFILE_UPDATED}:${user.id || user.email}:${new Date().toISOString().slice(0, 13)}`,
  }
}

export function buildOrderEmailPayload({
  event,
  order,
  tracking = null,
  to = null,
  message = null,
}) {
  return {
    event,
    to: to || order.customerEmail,
    orderId: order.id,
    userId: order.userId || null,
    customerName: order.customerName,
    orderReference: order.orderNumber || order.customerReference,
    orderStatus: order.status,
    actionUrl: `${getFrontendOrigin()}/account/orders/${order.orderNumber || order.id}`,
    message,
    tracking: tracking || order.shipment || order.shipments?.[0] || null,
    pricing: {
      subtotal: Number(order.subtotal || 0),
      discountAmount: Number(order.discountAmount || 0),
      shippingAmount: Number(order.shippingAmount || 0),
      taxAmount: Number(order.taxAmount || 0),
      donationAmount: Number(order.donationAmount || 0),
      total: Number(order.total || 0),
    },
    items: Array.isArray(order.items)
      ? order.items.map(mapOrderItem)
      : [],
    dedupeKey: `${event}:${order.id}`,
  }
}

export function buildAdminOrderEmailPayload({
  event,
  order,
  message = null,
}) {
  const adminRecipient =
    process.env.ADMIN_NOTIFICATION_EMAIL
    || process.env.ADMIN_EMAIL
    || null

  return {
    ...buildOrderEmailPayload({
      event,
      order,
      to: adminRecipient,
      message,
    }),
    customerEmail: order.customerEmail,
    dedupeKey: `${event}:${order.id}`,
  }
}

export function buildSupportRequestEmail({
  user,
  order,
  message,
}) {
  return {
    event: EMAIL_EVENTS.SUPPORT_REQUEST,
    to: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || null,
    customerEmail: user.email,
    customerName: user.name,
    orderReference: order?.orderNumber || order?.customerReference || null,
    orderId: order?.id || null,
    orderStatus: order?.status || null,
    message,
    dedupeKey: `${EMAIL_EVENTS.SUPPORT_REQUEST}:${order?.id || user.id}:${Date.now()}`,
  }
}

export function buildAdminFailedPaymentEmail({
  customerEmail = null,
  message = null,
}) {
  const adminRecipient =
    process.env.ADMIN_NOTIFICATION_EMAIL
    || process.env.ADMIN_EMAIL
    || null

  return {
    event: EMAIL_EVENTS.ADMIN_FAILED_PAYMENT,
    to: adminRecipient,
    customerEmail,
    message,
    dedupeKey: `${EMAIL_EVENTS.ADMIN_FAILED_PAYMENT}:${Date.now()}`,
  }
}
