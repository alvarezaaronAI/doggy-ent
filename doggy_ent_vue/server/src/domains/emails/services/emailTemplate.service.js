import { createHash } from 'node:crypto'
import { ORDER_EMAIL_SUGGESTIONS } from '../constants/orderEmailTemplates.constants.js'
import { validateEmailTemplate } from '../validators/emailTemplate.validator.js'
import { listEmailTemplates, findEmailTemplate, findStarterEmailTemplate, useStarterEmailTemplate, starterCopyId, updateEmailTemplate } from '../repositories/emailTemplate.repository.js'
import { findOrderById } from '../../orders/repositories/orders.repository.js'
import { renderOrderEmail } from '../mappers/orderEmail.mapper.js'
import { queueEmail, getEmailProviderStatus } from './emailProvider.service.js'
import { signCapability, readCapability } from '../../../shared/utils/signedCapability.js'
import { getCheckoutReceiptSettings } from './checkoutReceipt.service.js'
import { getOrderEmailPresentation } from '../utils/orderEmailPresentation.js'
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode })
export const sampleEmailOrder = Object.freeze({ customerName: 'Alex Morgan', customerEmail: 'alex@example.com', orderNumber: 'CE-SAMPLE', status: 'SHIPPED', currency: 'USD', subtotal: 24, shippingAmount: 5.99, taxAmount: 2.25, total: 32.24, address1: '123 Example Lane', city: 'Sample City', state: 'CA', zip: '90001', items: [{ productName: 'Chicken jerky', size: '18 oz', quantity: 1, unitPrice: 24, lineTotal: 24 }], shipment: { carrier: 'Sample carrier', trackingNumber: 'SAMPLE-TRACKING' } })
const withStarterOrigin = template => ({ ...template, sourceSuggestionId: ORDER_EMAIL_SUGGESTIONS.find(item => starterCopyId(item.id) === template.id)?.id || null })
export async function getEmailTemplates() {
  const saved = await listEmailTemplates(), suggestions = []
  for (const template of ORDER_EMAIL_SUGGESTIONS) {
    const copy = await findStarterEmailTemplate(template)
    if (copy && !saved.some(item => item.id === copy.id)) saved.push(copy)
    suggestions.push({ ...template, suggested: true, revision: 0, archived: false, editableCopyId: copy?.id || null })
  }
  return { templates: [...saved.map(withStarterOrigin), ...suggestions], provider: getEmailProviderStatus(), checkoutReceipt: await getCheckoutReceiptSettings() }
}
export async function saveEmailTemplate(id, input) {
  const data = validateEmailTemplate(input)
  if (!id || id.startsWith('suggested-')) {
    const suggestion = ORDER_EMAIL_SUGGESTIONS.find(item => item.id === (id || input.id))
    if (!suggestion) throw fail('Choose a starter template before adding it.')
    return withStarterOrigin(await useStarterEmailTemplate(suggestion, data))
  }
  if (!Number.isSafeInteger(input.revision)) throw fail('Reload this template before saving.')
  const saved = await updateEmailTemplate(id, input.revision, data)
  if (!saved) throw fail('This template changed in another editor. Your draft has not been overwritten.', 409)
  return withStarterOrigin(saved)
}
async function templateById(id) {
  const template = ORDER_EMAIL_SUGGESTIONS.find(template => template.id === id) || await findEmailTemplate(id)
  if (!template || template.archived) throw fail('Choose an active email template.', 404)
  return template
}
function eligibility(template, order) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail || '')) throw fail('This order has no valid email recipient.')
  const allowed = {
    ORDER_CONFIRMATION: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
    ORDER_STATUS_UPDATE: ['PROCESSING'],
    ORDER_SHIPPED: ['SHIPPED', 'DELIVERED'],
    ORDER_DELIVERED: ['DELIVERED'],
    ORDER_CANCELLED: ['CANCELLED'],
  }
  if (!allowed[template.event]?.includes(order.status)) throw fail('This template does not match the saved order status. Save the appropriate status or choose another template.')
  if (template.event === 'ORDER_SHIPPED' && !(order.shipment || order.shipments?.[0])?.trackingNumber) throw fail('Save carrier tracking before sending the shipped template.')
}
function fingerprint(template, order, rendered) {
  return createHash('sha256').update(JSON.stringify({ template: template.id, revision: template.revision || 0, updatedAt: order.updatedAt, recipient: order.customerEmail, rendered })).digest('hex')
}
export async function previewEmailTemplate(id, { orderId, draft } = {}, actor = '') {
  const template = draft ? { ...validateEmailTemplate(draft), id: 'unsaved' } : await templateById(id)
  const sampleStatus = { ORDER_CONFIRMATION: 'PAID', ORDER_STATUS_UPDATE: 'PROCESSING', ORDER_SHIPPED: 'SHIPPED', ORDER_DELIVERED: 'DELIVERED', ORDER_CANCELLED: 'CANCELLED' }[template.event]
  const order = orderId ? await findOrderById(orderId) : { ...sampleEmailOrder, status: sampleStatus, shipment: ['SHIPPED', 'DELIVERED'].includes(sampleStatus) ? sampleEmailOrder.shipment : null }
  if (!order) throw fail('Order not found.', 404)
  if (orderId) eligibility(template, order)
  const rendered = renderOrderEmail(template, order, getOrderEmailPresentation())
  const provider = getEmailProviderStatus()
  return {
    ...rendered, recipient: order.customerEmail, sample: !orderId, provider,
    templateId: template.id,
    previewProof: orderId && !draft ? signCapability('manual-order-email', { orderId, templateId: template.id, fingerprint: fingerprint(template, order, rendered), actor }) : null,
  }
}
export async function sendEmailTemplate(id, input = {}, actor = '') {
  if (input.confirmed !== true || input.dryRun !== true && input.dryRun !== false) throw fail('Preview and explicitly confirm the email first.')
  const proof = readCapability(input.previewProof, 'manual-order-email')
  if (!proof || proof.templateId !== id || proof.actor !== actor) throw fail('This preview expired. Preview the order email again.', 409)
  const template = await templateById(id), order = await findOrderById(proof.orderId)
  if (!order) throw fail('Order not found.', 404)
  eligibility(template, order)
  const rendered = renderOrderEmail(template, order, getOrderEmailPresentation())
  if (fingerprint(template, order, rendered) !== proof.fingerprint) throw fail('Order or template changed after preview. Preview again before sending.', 409)
  if (!input.dryRun && !getEmailProviderStatus().live) throw fail('The live email provider is disabled. Use a dry run or configure the provider.')
  const result = await queueEmail({
    event: template.event, to: order.customerEmail, orderId: order.id, userId: order.userId,
    renderedEmail: rendered, manualApproved: true, dryRun: input.dryRun,
    dedupeKey: `manual:${input.dryRun ? 'dry' : 'live'}:${proof.fingerprint}`,
    auditMetadata: { actorType: 'ADMIN', actor, templateId: template.id, templateRevision: template.revision || 0 },
  })
  return { status: result.status, message: result.status === 'SENT' ? 'Email accepted by the provider. Delivery is not yet confirmed.' : result.status === 'MOCKED' ? 'Dry run recorded. No email was sent.' : result.status === 'DUPLICATE' ? 'This exact email was already processed. No duplicate was sent.' : result.status === 'FAILED' ? 'Email failed. Review delivery activity before retrying.' : result.reason || 'No email was sent.' }
}
