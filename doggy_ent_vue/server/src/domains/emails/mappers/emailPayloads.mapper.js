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
    customerName: user.name,
    actionUrl: url,
  }
}

export function buildPasswordResetEmail({
  user,
  url,
}) {
  return {
    event: EMAIL_EVENTS.PASSWORD_RESET,
    to: user.email,
    customerName: user.name,
    actionUrl: url,
  }
}

export function buildWelcomeEmail(user) {
  return {
    event: EMAIL_EVENTS.WELCOME,
    to: user.email,
    customerName: user.name,
    actionUrl: `${getFrontendOrigin()}/account`,
  }
}

export function buildOrderEmailPayload({
  event,
  order,
}) {
  return {
    event,
    to: order.customerEmail,
    customerName: order.customerName,
    orderReference: order.orderNumber || order.customerReference,
    orderStatus: order.status,
    actionUrl: `${getFrontendOrigin()}/account/orders/${order.orderNumber || order.id}`,
    tracking: {
      available: false,
      message: 'Tracking updates are not configured yet.',
    },
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
  }
}

export function buildSupportRequestEmail({
  user,
  order,
  message,
}) {
  return {
    event: EMAIL_EVENTS.SUPPORT_REQUEST,
    to: process.env.SUPPORT_EMAIL || null,
    customerEmail: user.email,
    customerName: user.name,
    orderReference: order?.orderNumber || order?.customerReference || null,
    orderId: order?.id || null,
    orderStatus: order?.status || null,
    message,
  }
}
