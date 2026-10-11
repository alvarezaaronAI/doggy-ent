import {
  EMAIL_STATUS,
  EMAIL_EVENTS,
} from '../constants/emailEvents.constants.js'
import {
  renderEmailTemplate,
} from '../mappers/emailTemplates.mapper.js'
import {
  createEmailDelivery,
  findEmailDeliveryByDedupeKey,
  updateEmailDeliveryById,
} from '../repositories/emailDelivery.repository.js'
import { prisma } from '../../../db/prisma.js'

function getResendApiKey() {
  return String(process.env.RESEND_API_KEY || '').trim()
}

function getEmailFrom() {
  return String(
    process.env.EMAIL_FROM
    || process.env.RESEND_FROM_EMAIL
    || '',
  ).trim()
}

function getEmailReplyTo() {
  return String(
    process.env.EMAIL_REPLY_TO
    || process.env.RESEND_REPLY_TO_EMAIL
    || '',
  ).trim()
}

function isMockEmailMode() {
  const mode = String(
    process.env.EMAIL_PROVIDER
    || process.env.EMAIL_MODE
    || '',
  )
    .trim()
    .toUpperCase()

  return (
    process.env.NODE_ENV === 'test'
    || mode === 'MOCK'
    || mode === 'TEST'
    || !getResendApiKey()
    || !getEmailFrom()
  )
}

function sanitizeEmailError(error) {
  const message = String(error?.message || error || 'Email provider error.')
  const key = getResendApiKey()
  return (key ? message.replaceAll(key, '[redacted]') : message).slice(0, 500)
}

function getDedupeKey(payload) {
  return String(
    payload.dedupeKey
    || `${payload.event}:${payload.to}:${payload.orderId || payload.userId || ''}`,
  )
    .trim()
}

function normalizeRecipients(to) {
  return Array.isArray(to)
    ? to.map((recipient) => String(recipient || '').trim()).filter(Boolean)
    : [String(to || '').trim()].filter(Boolean)
}

async function isAllowedByNotificationPreferences(payload) {
  if (!payload.userId) {
    return true
  }

  const preference =
    await prisma.customerNotificationPreference.findUnique({
      where: {
        userId: payload.userId,
      },
    })

  if (!preference) {
    return true
  }

  if ([
    EMAIL_EVENTS.ORDER_STATUS_UPDATE,
    EMAIL_EVENTS.ORDER_CANCELLED,
    EMAIL_EVENTS.REFUND_ISSUED,
  ].includes(payload.event)) {
    return preference.orderUpdates !== false
  }

  if ([
    EMAIL_EVENTS.ORDER_SHIPPED,
    EMAIL_EVENTS.ORDER_DELIVERED,
    EMAIL_EVENTS.TRACKING_UPDATE,
  ].includes(payload.event)) {
    return preference.trackingUpdates !== false
  }

  if (payload.event === EMAIL_EVENTS.REVIEW_REQUEST) {
    return preference.reviewRequests !== false
  }

  return true
}

async function sendWithResend({
  html,
  subject,
  text,
  to,
  dedupeKey,
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': dedupeKey,
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to,
      subject,
      html,
      text,
      ...(getEmailReplyTo()
        ? {
            reply_to: getEmailReplyTo(),
          }
        : {}),
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      data?.message
      || data?.error?.message
      || `Resend returned ${response.status}.`,
    )

    error.statusCode = response.status
    throw error
  }

  return data
}

export function isEmailProviderConfigured() {
  return Boolean(getResendApiKey() && getEmailFrom())
}
export function getEmailProviderStatus() {
  return { configured: isEmailProviderConfigured(), live: !isMockEmailMode(), mode: isMockEmailMode() ? 'DRY_RUN' : 'RESEND' }
}

export async function queueEmail(payload = {}) {
  if (/^(ORDER_|TRACKING_|REVIEW_|ADMIN_|REFUND_|SUPPORT_)/.test(payload.event || '') && payload.manualApproved !== true) return { queued: false, status: EMAIL_STATUS.SKIPPED, reason: 'Order emails require an approved admin preview and send.' }
  const recipients = normalizeRecipients(payload.to)

  if (!payload.event || !recipients.length) {
    return {
      queued: false,
      status: EMAIL_STATUS.SKIPPED,
      reason: 'Missing email event or recipient.',
    }
  }

  const dedupeKey = getDedupeKey(payload)
  const existingDelivery =
    await findEmailDeliveryByDedupeKey(dedupeKey)

  if (existingDelivery) {
    return {
      queued: false,
      status: EMAIL_STATUS.DUPLICATE,
      delivery: existingDelivery,
    }
  }

  const rendered = payload.renderedEmail || renderEmailTemplate(payload)
  const provider = payload.dryRun || isMockEmailMode() ? 'MOCK' : 'RESEND'
  const allowedByPreferences =
    await isAllowedByNotificationPreferences(payload)

  if (!allowedByPreferences) {
    const delivery = await createEmailDelivery({
      dedupeKey,
      event: payload.event,
      recipient: recipients.join(','),
      subject: rendered.subject,
      provider,
      status: EMAIL_STATUS.SKIPPED,
      orderId: payload.orderId || null,
      userId: payload.userId || null,
      metadata: {
        reason: 'Customer notification preference disabled this event.',
      },
      sentAt: null,
    })

    return {
      queued: false,
      status: EMAIL_STATUS.SKIPPED,
      delivery,
      reason: 'Customer notification preference disabled this event.',
    }
  }

  const initialStatus = provider === 'MOCK'
    ? EMAIL_STATUS.MOCKED
    : 'PENDING'

  let delivery
  try { delivery = await createEmailDelivery({
    dedupeKey,
    event: payload.event,
    recipient: recipients.join(','),
    subject: rendered.subject,
    provider,
    status: initialStatus,
    orderId: payload.orderId || null,
    userId: payload.userId || null,
    metadata: {
      hasActionUrl: Boolean(payload.actionUrl),
      orderReference: payload.orderReference || null,
      mockMode: provider === 'MOCK',
      ...payload.auditMetadata,
    },
    sentAt: provider === 'MOCK' ? new Date() : null,
  }) } catch (error) {
    if (error.code !== 'P2002') throw error
    return { queued: false, status: EMAIL_STATUS.DUPLICATE, delivery: await findEmailDeliveryByDedupeKey(dedupeKey) }
  }

  if (provider === 'MOCK') {
    console.info(
      `[email] Dry run recorded for ${payload.event}; no email sent.`,
    )

    return {
      queued: true,
      status: EMAIL_STATUS.MOCKED,
      delivery,
    }
  }

  try {
    const result = await sendWithResend({
      ...rendered,
      to: recipients,
      dedupeKey,
    })

    const updatedDelivery = await updateEmailDeliveryById(
      delivery.id,
      {
        status: EMAIL_STATUS.SENT,
        providerId: result?.id || null,
        sentAt: new Date(),
      },
    )

    return {
      queued: true,
      status: EMAIL_STATUS.SENT,
      delivery: updatedDelivery,
    }
  }
  catch (error) {
    const safeMessage = sanitizeEmailError(error)

    console.error(
      `[email] ${payload.event} email failed: ${safeMessage}`,
    )

    const updatedDelivery = await updateEmailDeliveryById(
      delivery.id,
      {
        status: EMAIL_STATUS.FAILED,
        errorMessage: safeMessage,
      },
    )

    return {
      queued: false,
      status: EMAIL_STATUS.FAILED,
      delivery: updatedDelivery,
      reason: safeMessage,
    }
  }
}
