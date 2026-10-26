import { createHash } from 'node:crypto'
import { findReceiptSettings, saveReceiptSettings } from '../repositories/checkoutReceipt.repository.js'
import { getEmailProviderStatus } from './emailProvider.service.js'
import { renderOrderEmail } from '../mappers/orderEmail.mapper.js'
import { getOrderEmailPresentation } from '../utils/orderEmailPresentation.js'

const fail = message => Object.assign(new Error(message), { statusCode: 400 })
const modes = ['DISABLED', 'DRY_RUN', 'LIVE']

export function isAutomaticReceiptLiveEnabled() {
  return process.env.CHECKOUT_RECEIPT_SEND_ENABLED === 'true' && getEmailProviderStatus().live
}

export async function getCheckoutReceiptSettings() {
  const settings = await findReceiptSettings()
  return {
    mode: settings?.mode || 'DISABLED',
    templateId: settings?.templateId || null,
    revision: settings?.revision || 0,
    liveAvailable: isAutomaticReceiptLiveEnabled(),
  }
}

export async function updateCheckoutReceiptSettings(input = {}, actor) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw fail('Check the receipt settings.')
  if (Object.keys(input).some(key => !['mode', 'templateId', 'revision'].includes(key))) throw fail('Unexpected receipt setting.')
  if (!modes.includes(input.mode) || !Number.isSafeInteger(input.revision) || input.revision < 0 || input.revision >= 2147483647) throw fail('Reload and choose a valid receipt mode.')
  const templateId = input.templateId === null ? null : typeof input.templateId === 'string' ? input.templateId.trim() : ''
  if ((input.mode !== 'DISABLED' && !templateId) || (templateId && templateId.length > 100)) throw fail('Choose a saved payment-confirmation template.')
  if (input.mode === 'LIVE' && !isAutomaticReceiptLiveEnabled()) throw fail('Live receipts are locked until the sending domain/provider is verified and the server sending switch is enabled.')
  await saveReceiptSettings({ mode: input.mode, templateId: templateId || null, revision: input.revision }, actor)
  return getCheckoutReceiptSettings()
}

export async function prepareCheckoutReceipt(order) {
  const settings = await findReceiptSettings()
  if (!settings || settings.mode === 'DISABLED') return null
  const template = settings.template
  if (!template || template.archived || template.event !== 'ORDER_CONFIRMATION') return null
  if (!order.stripePaymentIntentId || order.status !== 'PAID') return null
  const rendered = renderOrderEmail(template, order, getOrderEmailPresentation())
  return {
    dedupeKey: `checkout-receipt:${createHash('sha256').update(order.stripePaymentIntentId).digest('hex')}`,
    event: 'ORDER_CONFIRMATION',
    recipient: order.customerEmail,
    subject: rendered.subject,
    provider: settings.mode === 'DRY_RUN' ? 'MOCK' : 'RESEND',
    status: 'QUEUED',
    automatic: true,
    renderedEmail: rendered,
    userId: order.userId || null,
    metadata: { source: 'VERIFIED_CHECKOUT', templateId: template.id, templateRevision: template.revision, settingsRevision: settings.revision },
  }
}
