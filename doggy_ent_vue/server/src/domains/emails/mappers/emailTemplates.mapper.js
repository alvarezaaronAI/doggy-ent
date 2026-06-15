import {
  EMAIL_EVENTS,
} from '../constants/emailEvents.constants.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function formatDate(value) {
  if (!value) {
    return 'Not available yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function buildItemsHtml(items = []) {
  if (!items.length) {
    return '<p>No item details were available.</p>'
  }

  return `
    <ul>
      ${items.map((item) => `
        <li>
          ${escapeHtml(item.productName)} (${escapeHtml(item.size)})
          × ${Number(item.quantity || 0)}
          - ${formatCurrency(item.lineTotal)}
        </li>
      `).join('')}
    </ul>
  `
}

function buildItemsText(items = []) {
  if (!items.length) {
    return 'No item details were available.'
  }

  return items
    .map((item) =>
      `- ${item.productName} (${item.size}) x ${Number(item.quantity || 0)}: ${formatCurrency(item.lineTotal)}`,
    )
    .join('\n')
}

function getEventSubject(payload) {
  const reference = payload.orderReference
    ? ` ${payload.orderReference}`
    : ''

  const subjects = {
    [EMAIL_EVENTS.ACCOUNT_CREATED]: 'Your Chase & Evie Co. account is ready',
    [EMAIL_EVENTS.ACCOUNT_UPDATED]: 'Your Chase & Evie Co. account was updated',
    [EMAIL_EVENTS.ACCOUNT_VERIFICATION]: 'Verify your Chase & Evie Co. email',
    [EMAIL_EVENTS.EMAIL_VERIFICATION]: 'Verify your Chase & Evie Co. email',
    [EMAIL_EVENTS.ORDER_CANCELLED]: `Order${reference} was cancelled`,
    [EMAIL_EVENTS.ORDER_CONFIRMATION]: `Order${reference} confirmation`,
    [EMAIL_EVENTS.ORDER_DELIVERED]: `Order${reference} was delivered`,
    [EMAIL_EVENTS.ORDER_SHIPPED]: `Order${reference} has shipped`,
    [EMAIL_EVENTS.ORDER_STATUS_UPDATE]: `Order${reference} status update`,
    [EMAIL_EVENTS.PASSWORD_CHANGED]: 'Your Chase & Evie Co. password was changed',
    [EMAIL_EVENTS.PASSWORD_RESET]: 'Reset your Chase & Evie Co. password',
    [EMAIL_EVENTS.PROFILE_UPDATED]: 'Your Chase & Evie Co. profile was updated',
    [EMAIL_EVENTS.REFUND_ISSUED]: `Refund update for order${reference}`,
    [EMAIL_EVENTS.TRACKING_UPDATE]: `Tracking update for order${reference}`,
    [EMAIL_EVENTS.WELCOME]: 'Welcome to Chase & Evie Co.',
    [EMAIL_EVENTS.ADMIN_FAILED_PAYMENT]: `Admin alert: failed payment${reference}`,
    [EMAIL_EVENTS.ADMIN_NEW_ORDER]: `Admin alert: new order${reference}`,
    [EMAIL_EVENTS.ADMIN_REFUND_SUPPORT_NOTIFICATION]: `Admin alert: refund/support${reference}`,
    [EMAIL_EVENTS.SUPPORT_REQUEST]: 'New customer support request',
  }

  return subjects[payload.event] || 'Chase & Evie Co. update'
}

function getIntro(payload) {
  if (payload.event === EMAIL_EVENTS.PASSWORD_RESET) {
    return 'Use the link below to reset your password.'
  }

  if (payload.event === EMAIL_EVENTS.ACCOUNT_VERIFICATION || payload.event === EMAIL_EVENTS.EMAIL_VERIFICATION) {
    return 'Please verify your email address to finish securing your account.'
  }

  if (payload.event === EMAIL_EVENTS.ORDER_CONFIRMATION) {
    return 'Thanks for your order. We received your secure payment and your treats are queued for fulfillment.'
  }

  if (payload.event === EMAIL_EVENTS.ORDER_SHIPPED) {
    return 'Good news: your order has shipped.'
  }

  if (payload.event === EMAIL_EVENTS.ORDER_DELIVERED) {
    return 'Your order has been marked delivered.'
  }

  if (payload.event === EMAIL_EVENTS.ORDER_CANCELLED) {
    return 'Your order has been cancelled. If this looks wrong, contact support.'
  }

  if (payload.event === EMAIL_EVENTS.REFUND_ISSUED) {
    return 'A refund update was issued for your order.'
  }

  if (payload.event?.startsWith('ADMIN_')) {
    return 'Admin notification for Chase & Evie Co.'
  }

  return 'Here is the latest update from Chase & Evie Co.'
}

function buildTrackingHtml(tracking) {
  if (!tracking?.trackingNumber) {
    return ''
  }

  const link = tracking.trackingUrl
    ? `<p><a href="${escapeHtml(tracking.trackingUrl)}">Track package</a></p>`
    : ''

  return `
    <h2>Tracking</h2>
    <p>Status: ${escapeHtml(tracking.shipmentStatus || 'UNKNOWN')}</p>
    <p>Carrier: ${escapeHtml(tracking.carrier || 'N/A')}</p>
    <p>Tracking number: ${escapeHtml(tracking.trackingNumber)}</p>
    <p>Estimated delivery: ${escapeHtml(formatDate(tracking.estimatedDelivery))}</p>
    ${link}
  `
}

function buildTrackingText(tracking) {
  if (!tracking?.trackingNumber) {
    return ''
  }

  return [
    'Tracking',
    `Status: ${tracking.shipmentStatus || 'UNKNOWN'}`,
    `Carrier: ${tracking.carrier || 'N/A'}`,
    `Tracking number: ${tracking.trackingNumber}`,
    `Estimated delivery: ${formatDate(tracking.estimatedDelivery)}`,
    tracking.trackingUrl ? `Track package: ${tracking.trackingUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function renderEmailTemplate(payload) {
  const subject = payload.subject || getEventSubject(payload)
  const intro = getIntro(payload)
  const actionHtml = payload.actionUrl
    ? `<p><a href="${escapeHtml(payload.actionUrl)}">Open details</a></p>`
    : ''
  const actionText = payload.actionUrl
    ? `Open details: ${payload.actionUrl}`
    : ''
  const orderHtml = payload.orderReference
    ? `
      <h2>Order ${escapeHtml(payload.orderReference)}</h2>
      ${buildItemsHtml(payload.items)}
      <p>Subtotal: ${formatCurrency(payload.pricing?.subtotal)}</p>
      <p>Discount: ${formatCurrency(payload.pricing?.discountAmount)}</p>
      <p>Shipping: ${formatCurrency(payload.pricing?.shippingAmount)}</p>
      <p>Tax: ${formatCurrency(payload.pricing?.taxAmount)}</p>
      <p>Total: ${formatCurrency(payload.pricing?.total)}</p>
    `
    : ''
  const orderText = payload.orderReference
    ? [
        `Order ${payload.orderReference}`,
        buildItemsText(payload.items),
        `Subtotal: ${formatCurrency(payload.pricing?.subtotal)}`,
        `Discount: ${formatCurrency(payload.pricing?.discountAmount)}`,
        `Shipping: ${formatCurrency(payload.pricing?.shippingAmount)}`,
        `Tax: ${formatCurrency(payload.pricing?.taxAmount)}`,
        `Total: ${formatCurrency(payload.pricing?.total)}`,
      ].join('\n')
    : ''

  return {
    subject,
    html: `
      <main>
        <h1>${escapeHtml(subject)}</h1>
        <p>Hi ${escapeHtml(payload.customerName || 'there')},</p>
        <p>${escapeHtml(intro)}</p>
        ${orderHtml}
        ${buildTrackingHtml(payload.tracking)}
        ${payload.message ? `<p>${escapeHtml(payload.message)}</p>` : ''}
        ${actionHtml}
        <p>Chase & Evie Co.</p>
      </main>
    `,
    text: [
      subject,
      `Hi ${payload.customerName || 'there'},`,
      intro,
      orderText,
      buildTrackingText(payload.tracking),
      payload.message || '',
      actionText,
      'Chase & Evie Co.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}
