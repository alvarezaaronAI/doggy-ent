import { givingBeneficiaries } from '../../storefront/content/commercePresentation.js'
import { mapPublicTaxDetails } from '../../../shared/utils/taxSnapshot.js'

const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
const labelStyle = 'margin:0 0 16px;font-size:18px;line-height:26px;font-weight:700;color:#6A3C2B;'
const paragraphStyle = 'margin:0 0 16px;font-size:16px;line-height:26px;'
const amountStyle = 'text-align:right;font-variant-numeric:tabular-nums;'
const messageLabels = {
  ORDER_CONFIRMATION: 'Order receipt',
  ORDER_STATUS_UPDATE: 'Order update',
  ORDER_SHIPPED: 'Shipping update',
  ORDER_DELIVERED: 'Delivery update',
  ORDER_CANCELLED: 'Order update',
}

function safeUrl(value) {
  if (typeof value !== 'string' || !/^https:\/\//i.test(value) || /[\u0000-\u0020\u007f\\]/.test(value)) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}

function assetBase(value) {
  const safe = safeUrl(value)
  if (!safe) return ''
  const url = new URL(safe)
  // Asset bases are public directories, never signed URLs or recipient-specific links.
  if (url.href.includes('?') || url.href.includes('#')) return ''
  return url.href.replace(/\/+$/, '')
}

export function renderOrderEmail(template, order, options = {}) {
  const values = {
    customerName: order.customerName || 'there',
    orderReference: order.customerReference || order.orderNumber || '',
    orderStatus: String(order.status || '').toLowerCase().replaceAll('_', ' '),
  }
  const expand = value => String(value ?? '').replace(/{{\s*(customerName|orderReference|orderStatus)\s*}}/g, (_match, key) => values[key])
  const subject = expand(template.subject).replace(/[\u0000-\u001f\u007f]/g, ' ')
  const heading = expand(template.heading), body = expand(template.body), footer = expand(template.footer)
  const currency = typeof order.currency === 'string' && /^[a-z]{3}$/i.test(order.currency) ? order.currency.toUpperCase() : 'USD'
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })
  const money = value => Number.isFinite(Number(value ?? 0)) ? formatter.format(Number(value ?? 0)) : 'Unavailable'
  const base = assetBase(options?.assetBaseUrl)
  const asset = name => base ? `${base}/${name}.png` : ''
  const icon = name => base ? `<img src="${escape(asset(name))}" width="22" height="22" alt="" role="presentation" style="display:inline-block;width:22px;height:22px;margin-right:10px;vertical-align:middle;border:0;">` : ''
  const sectionHeading = (title, name) => `<h2 style="${labelStyle}">${icon(name)}${title}</h2>`
  const shipment = order.shipment || order.shipments?.[0]
  const trackingUrl = safeUrl(shipment?.trackingUrl)
  const orderItems = order.items || []
  const items = orderItems.map(item => {
    const quantity = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 'Unavailable'
    return `<tr>
      <td style="padding:16px 12px 16px 0;border-bottom:1px solid #e2e5e9;vertical-align:top;overflow-wrap:anywhere;word-break:break-word;">
        <strong style="font-size:16px;line-height:24px;">${escape(item.productName)}</strong>
        ${item.size ? `<div style="margin-top:4px;font-size:14px;line-height:22px;color:#59636c;">${escape(item.size)}</div>` : ''}
        <div style="margin-top:4px;font-size:13px;line-height:21px;color:#59636c;">Qty ${quantity} &middot; ${escape(money(item.unitPrice))} each</div>
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #e2e5e9;vertical-align:top;font-size:16px;line-height:24px;${amountStyle}">${escape(money(item.lineTotal))}</td>
    </tr>`
  }).join('')
  const taxDetails = mapPublicTaxDetails(order.taxSnapshot || order.taxDetails, Number(order.taxAmount || 0))
  const taxLabel = taxDetails?.status === 'not_configured' ? 'Tax not collected' : taxDetails?.ratePercent != null ? `Sales tax (${taxDetails.ratePercent}%)` : 'Tax'
  const totalRows = [
    ['Subtotal', order.subtotal],
    ...(order.discountAmount > 0 ? [['Discount', -order.discountAmount]] : []),
    ['Shipping', order.shippingAmount],
    [taxLabel, order.taxAmount],
  ]
  const totals = totalRows.map(([label, value]) => `<tr><th scope="row" style="padding:6px 12px 6px 0;text-align:left;font-weight:400;">${escape(label)}</th><td style="padding:6px 0;${amountStyle}">${escape(money(value))}</td></tr>`).join('')
  const addressLines = [order.customerName, order.address1, order.address2, [order.city, order.state, order.zip].filter(Boolean).join(', '), order.country].filter(Boolean)
  const address = addressLines.map(escape).join('<br>')
  const shippingMethod = [order.shippingCarrier, order.shippingService || order.shippingMethod].filter(Boolean).join(' - ')
  const tracking = shipment?.trackingNumber ? `
    <tr><td class="content-pad" style="padding:24px 32px;border-top:1px solid #e2e5e9;">
      ${sectionHeading('Delivery tracking', 'package')}
      <p style="${paragraphStyle}font-size:14px;">${shipment.carrier ? `${escape(shipment.carrier)}<br>` : ''}${escape(shipment.trackingNumber)}</p>
      ${trackingUrl ? `<a href="${escape(trackingUrl)}" style="display:inline-block;padding:12px 18px;border:1px solid #2F57B7;border-radius:4px;color:#2F57B7;font-size:15px;font-weight:700;line-height:22px;text-decoration:underline;">Track your package</a>` : ''}
    </td></tr>` : ''
  const beneficiaries = givingBeneficiaries(order.campaignAttributions || order.campaignUsages || [])
  const givingDescription = `This purchase supports ${beneficiaries} at no extra cost to you.`
  const givingFunding = 'Funded by Chase & Evie Co. and not added to your bill.'
  const givingText = order.donationAmount > 0 ? `Thank you for sharing a little good.\n${givingDescription} Our contribution from eligible items is ${money(order.donationAmount)}. ${givingFunding}` : ''
  const giving = givingText ? `
    <tr><td class="content-pad" bgcolor="#edf6f0" style="padding:24px 32px;background-color:#edf6f0;border-top:1px solid #dce5df;color:#17634c;">
      <h2 style="${labelStyle}color:#17634c;">${icon('heart')}Thank you for sharing a little good.</h2>
      <p style="margin:0 0 8px;font-size:26px;font-weight:700;line-height:34px;font-variant-numeric:tabular-nums;">${escape(money(order.donationAmount))}</p>
      <p style="margin:0 0 8px;font-size:14px;line-height:23px;">${escape(givingDescription)}</p>
      <p style="margin:0;font-size:13px;line-height:22px;">${escape(givingFunding)}</p>
    </td></tr>` : ''
  const monogram = base ? `<tr><td background="${escape(asset('monogram'))}" bgcolor="#F3E8D2" height="64" aria-hidden="true" style="height:64px;background-color:#F3E8D2;background-repeat:repeat;background-size:320px 320px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''
  // Inline/table defaults carry the receipt when a mail client strips head styles.
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(subject)}</title>
<style>
  body, table, td, th { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  @media only screen and (max-width:480px) {
    .email-shell { padding:12px 8px !important; }
    .content-pad { padding-left:20px !important; padding-right:20px !important; }
    .email-heading { font-size:24px !important; line-height:32px !important; }
  }
</style></head>
<body style="margin:0;padding:0;width:100%;background-color:#f5f6f8;color:#303b34;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f6f8" style="width:100%;background-color:#f5f6f8;"><tr><td class="email-shell" align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;max-width:640px;margin:0 auto;background-color:#ffffff;color:#303b34;font-family:Arial,Helvetica,sans-serif;border:1px solid #e2e5e9;border-top:4px solid #F2DE5C;border-radius:8px;box-shadow:0 4px 16px rgba(48,59,52,0.06);table-layout:fixed;overflow-wrap:anywhere;word-break:break-word;">
  ${monogram}
  <tr><td class="content-pad" style="padding:24px 32px;border-bottom:1px solid #e2e5e9;">
    <p style="margin:0;font-size:22px;font-weight:700;line-height:30px;color:#6A3C2B;">${icon('paw')}Chase &amp; Evie Co.</p>
    <p style="margin:6px 0 0;font-size:13px;line-height:20px;color:#59636c;">Good treats. Good company.</p>
  </td></tr>
  <tr><td class="content-pad" style="padding:28px 32px 8px;">
    <p style="margin:0 0 8px;font-size:13px;line-height:21px;font-weight:700;color:#2F57B7;">${messageLabels[template.event] || 'Order update'}</p>
    ${values.orderReference ? `<p style="margin:0 0 20px;font-size:14px;line-height:22px;color:#59636c;">Order ${escape(values.orderReference)}</p>` : ''}
    <h1 class="email-heading" style="margin:0 0 20px;font-size:28px;line-height:36px;font-weight:700;color:#6A3C2B;">${escape(heading)}</h1>
    ${body.split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p style="${paragraphStyle}">${escape(paragraph).replaceAll('\n', '<br>')}</p>`).join('')}
  </td></tr>
  <tr><td class="content-pad" style="padding:16px 32px 24px;">
    ${sectionHeading('Your order', 'receipt')}
    <table aria-label="Order items" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse;">
      <thead><tr><th scope="col" width="72%" style="width:72%;padding:0 12px 10px 0;border-bottom:1px solid #e2e5e9;font-size:12px;line-height:20px;text-align:left;color:#59636c;">Item</th><th scope="col" width="28%" style="width:28%;padding:0 0 10px;border-bottom:1px solid #e2e5e9;font-size:12px;line-height:20px;color:#59636c;${amountStyle}">Line total</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <table aria-label="Order totals" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin-top:16px;table-layout:fixed;border-collapse:collapse;font-size:14px;line-height:22px;">
      <tbody>${totals}<tr><th scope="row" style="padding:16px 12px 0 0;border-top:2px solid #2F57B7;text-align:left;font-size:18px;line-height:28px;color:#6A3C2B;">Order total</th><td style="padding:16px 0 0;border-top:2px solid #2F57B7;font-size:22px;line-height:28px;font-weight:700;color:#6A3C2B;${amountStyle}">${escape(money(order.total))}</td></tr></tbody>
    </table>
  </td></tr>
  ${giving}
  ${address || shippingMethod ? `<tr><td class="content-pad" style="padding:24px 32px;border-top:1px solid #e2e5e9;">
    ${sectionHeading('Shipping to', 'package')}
    ${address ? `<p style="margin:0;font-size:14px;line-height:24px;">${address}</p>` : ''}
    ${shippingMethod ? `<p style="margin:12px 0 0;font-size:13px;line-height:22px;color:#59636c;">Shipping method: ${escape(shippingMethod)}</p>` : ''}
  </td></tr>` : ''}
  ${tracking}
  <tr><td class="content-pad" style="padding:24px 32px;border-top:1px solid #e2e5e9;">
    <p style="margin:0;font-size:14px;line-height:24px;color:#59636c;">${escape(footer).replaceAll('\n', '<br>')}</p>
    <p style="margin:20px 0 0;font-size:14px;font-weight:700;line-height:24px;color:#6A3C2B;">With care,<br>Chase &amp; Evie Co.</p>
  </td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
  const text = [
    'Chase & Evie Co.', heading, body, values.orderReference ? `Order ${values.orderReference}` : '', 'Your order',
    ...orderItems.map(item => `${item.productName}${item.size ? ` - ${item.size}` : ''} - Qty ${Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 'Unavailable'} - ${money(item.unitPrice)} each - ${money(item.lineTotal)}`),
    totalRows.map(([label, value]) => `${label}: ${money(value)}`).join('\n'),
    `Order total: ${money(order.total)}`, givingText,
    address ? `Shipping to\n${addressLines.join('\n')}` : '',
    shippingMethod ? `Shipping method: ${shippingMethod}` : '',
    shipment?.trackingNumber ? ['Delivery tracking', shipment.carrier, shipment.trackingNumber, trackingUrl].filter(Boolean).join('\n') : '',
    footer, 'With care,\nChase & Evie Co.',
  ].filter(Boolean).join('\n\n')
  return { subject, html, text }
}
