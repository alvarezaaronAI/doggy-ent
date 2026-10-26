import { describe, expect, it, vi } from 'vitest'
import { ORDER_EMAIL_SUGGESTIONS } from '../../../src/domains/emails/constants/orderEmailTemplates.constants.js'
import { renderOrderEmail } from '../../../src/domains/emails/mappers/orderEmail.mapper.js'
import { validateEmailTemplate } from '../../../src/domains/emails/validators/emailTemplate.validator.js'

const confirmation = ORDER_EMAIL_SUGGESTIONS.find(template => template.event === 'ORDER_CONFIRMATION')
const assetBaseUrl = 'https://shop.example.com/email-assets'
const orderFixture = (overrides = {}) => ({
  customerName: 'Jamie Example', customerReference: 'CE-FICTIONAL-1042', status: 'PAID', currency: 'usd',
  subtotal: 49.98, discountAmount: 5, shippingAmount: 5.99, taxAmount: 4.08, total: 55.05,
  address1: '123 Example Lane', address2: 'Unit 2', city: 'Sample City', state: 'CA', zip: '90001', country: 'US',
  shippingCarrier: 'Example carrier', shippingService: 'Standard',
  donationAmount: 4, campaignAttributions: [{ donationTarget: 'Fictional Rescue' }],
  items: [
    { productName: 'Example chicken treats', size: '6 oz', quantity: 2, unitPrice: 14.99, lineTotal: 29.98 },
    { productName: 'Example salmon treats', size: '6 oz', quantity: 1, unitPrice: 20, lineTotal: 20 },
  ],
  ...overrides,
})
const links = html => [...html.matchAll(/\b(?:src|href|background)="([^"]*)"/g)].map(match => match[1])
const table = (html, label) => html.match(new RegExp(`<table aria-label="${label}"[^>]*>[\\s\\S]*?</table>`))?.[0]

describe('order email visual renderer', () => {
  it('keeps the two-argument contract, deterministic rendering and untouched saved inputs', () => {
    const order = orderFixture(), original = structuredClone(order)
    const result = renderOrderEmail(confirmation, order)
    expect(Object.keys(result).sort()).toEqual(['html', 'subject', 'text'])
    expect(result).toEqual(renderOrderEmail(confirmation, order))
    expect(order).toEqual(original)
    expect(result.html).toContain('<html lang="en">')
    expect(result.html).toContain('Chase &amp; Evie Co.')
    expect(result.html).toContain('CE-FICTIONAL-1042')
    expect(result.html).not.toMatch(/<img\b|\bbackground="https:/)
    expect(result.html).not.toContain('undefined')
    expect(result.text).toContain('Chase & Evie Co.')
  })

  it('confirms payment, manual fulfilment review and separate shipping information only', () => {
    const rendered = renderOrderEmail(confirmation, orderFixture())
    expect(rendered.subject).toContain('Payment received')
    for (const value of [rendered.html, rendered.text]) {
      expect(value).toContain('We have received your payment.')
      expect(value).toContain('manually reviews each order before fulfilment')
      expect(value).toContain('Shipping information will be shared separately.')
      expect(value).not.toMatch(/(?:has|have) shipped|on (?:its|their) way|preparing|refund|inbox|email (?:was|has been) (?:sent|delivered)/i)
    }
  })

  it.each(ORDER_EMAIL_SUGGESTIONS)('uses the same complete visual receipt for $event', template => {
    expect(validateEmailTemplate(template).event).toBe(template.event)
    const rendered = renderOrderEmail(template, orderFixture(), { assetBaseUrl })
    expect(rendered.html).toContain(`>${template.heading}</h1>`)
    expect(table(rendered.html, 'Order items')).toContain('Example chicken treats')
    expect(table(rendered.html, 'Order totals')).toContain('Order total')
    expect(rendered.text).toContain('Order total: $55.05')
    expect(rendered.html).not.toMatch(/{{|}}/)
    expect(rendered.html).toContain('With care,')
  })

  it('uses saved unit prices, line totals and final totals without recalculating the bill', () => {
    const rendered = renderOrderEmail(confirmation, orderFixture({
      subtotal: 91.21, discountAmount: 2.03, shippingAmount: 3.04, taxAmount: 4.05, total: 88.88,
      items: [{ productName: 'Historical snapshot', size: '18 oz', quantity: 3, unitPrice: 9.87, lineTotal: 21.23 }],
    }))
    const receipt = table(rendered.html, 'Order totals')
    for (const amount of ['$91.21', '-$2.03', '$3.04', '$4.05', '$88.88']) expect(receipt).toContain(amount)
    expect(table(rendered.html, 'Order items')).toContain('$9.87 each')
    expect(table(rendered.html, 'Order items')).toContain('$21.23')
    expect(rendered.text).toContain('Subtotal: $91.21\nDiscount: -$2.03\nShipping: $3.04\nTax: $4.05')
    expect(rendered.text).toContain('Order total: $88.88')
    expect(rendered.html).not.toContain('$96.27')
    expect(rendered.html).not.toContain('$29.61')
  })

  it('keeps positive giving outside both receipt tables, after the final total in HTML and text', () => {
    const rendered = renderOrderEmail(confirmation, orderFixture({
      campaignAttributions: [{ donationTarget: 'Fictional Rescue' }, { donationTarget: 'Fictional Rescue' }, { campaign: { donationTarget: 'Example Sanctuary' } }],
    }))
    expect(table(rendered.html, 'Order items')).not.toContain('giving')
    expect(table(rendered.html, 'Order totals')).not.toMatch(/giving|donation|contribution|\$4\.00/i)
    for (const value of [rendered.html, rendered.text]) {
      expect(value.indexOf('Thank you for sharing')).toBeGreaterThan(value.indexOf('$55.05'))
      expect(value).toContain('$4.00')
      expect(value).toContain('supports Fictional Rescue, Example Sanctuary at no extra cost to you')
      expect(value).toContain('not added to your bill')
      expect(value).not.toMatch(/has been donated|paid to|payout|Fictional Rescue, Fictional Rescue/)
    }
  })

  it.each([0, undefined, -1])('omits giving when the saved amount is %s', donationAmount => {
    const rendered = renderOrderEmail(confirmation, orderFixture({ donationAmount }), { assetBaseUrl })
    for (const value of [rendered.html, rendered.text]) expect(value).not.toMatch(/Thank you for sharing|Fictional Rescue|not added to your bill|heart\.png/)
    expect(table(rendered.html, 'Order totals')).toContain('$55.05')
  })

  it('keeps complete shipping snapshots and shipment-array tracking in both formats', () => {
    const rendered = renderOrderEmail(ORDER_EMAIL_SUGGESTIONS[2], orderFixture({
      status: 'SHIPPED', shipments: [{ carrier: 'Example carrier', trackingNumber: 'FICTIONAL-TRACKING', trackingUrl: 'https://carrier.example.com/track?id=sample&lang=en' }],
    }))
    for (const value of [rendered.html, rendered.text]) {
      for (const expected of ['123 Example Lane', 'Unit 2', 'Sample City, CA, 90001', 'US', 'Example carrier - Standard', 'FICTIONAL-TRACKING']) expect(value).toContain(expected)
    }
    expect(rendered.html).toContain('href="https://carrier.example.com/track?id=sample&amp;lang=en"')
    expect(rendered.text).toContain('https://carrier.example.com/track?id=sample&lang=en')
  })

  it('escapes malicious templates, customer, item, address, carrier and beneficiary fields', () => {
    const attack = '<img src=x onerror="alert(1)"> & \'payload\''
    const rendered = renderOrderEmail({ ...confirmation, heading: attack, body: `{{customerName}}\n\n${attack}`, footer: attack }, orderFixture({
      customerName: attack, customerReference: attack, address1: attack, address2: attack, city: attack, country: attack,
      shippingCarrier: attack, shippingService: attack,
      items: [{ productName: attack, size: attack, quantity: attack, unitPrice: attack, lineTotal: attack }],
      campaignAttributions: [{ donationTarget: attack }], shipment: { carrier: attack, trackingNumber: attack, trackingUrl: 'javascript:alert(1)' },
    }))
    expect(rendered.html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#039;payload&#039;')
    expect(rendered.html).not.toContain(attack)
    expect(rendered.html).not.toMatch(/<(?:script|img|iframe)\b|<[^>]+\son\w+=|javascript:/i)
    expect(rendered.html).toContain('Unavailable')
    expect(rendered.html).not.toContain('NaN')
  })

  it('removes header controls after expanding customer-controlled placeholders', () => {
    const rendered = renderOrderEmail({ ...confirmation, subject: '{{customerName}} {{orderReference}}\u0000' }, orderFixture({ customerName: 'Name\r\nBcc: attacker@example.com', customerReference: 'REF\t\u007f' }))
    expect(rendered.subject).not.toMatch(/[\u0000-\u001f\u007f]/)
    expect(rendered.html).not.toContain('<title>Name\r\n')
  })

  it.each([
    'http://carrier.example.com/track', '//carrier.example.com/track', 'javascript:alert(1)', 'data:text/html,bad',
    'https://name:password@carrier.example.com/track', 'https://name@carrier.example.com/track',
    'https://carrier.example.com\\@evil.example.com/track', 'https://carrier.example.com/\ntrack', '', null, {},
  ])('never emits an unsafe tracking URL: %s', trackingUrl => {
    const rendered = renderOrderEmail(confirmation, orderFixture({ shipment: { carrier: 'Example carrier', trackingNumber: 'FICTIONAL-TRACKING', trackingUrl } }))
    expect(links(rendered.html)).toEqual([])
    expect(rendered.html).not.toContain('Track your package')
    expect(rendered.text).not.toMatch(/https?:|javascript:|data:text/)
    expect(rendered.text).toContain('FICTIONAL-TRACKING')
  })

  it('requires saved tracking details before rendering a tracking action', () => {
    const rendered = renderOrderEmail(confirmation, orderFixture({ shipment: { trackingUrl: 'https://carrier.example.com/track' } }))
    expect(rendered.html).not.toContain('Delivery tracking')
    expect(rendered.text).not.toContain('carrier.example.com')
  })

  it('uses only fixed public PNG assets from an explicit HTTPS base with decorative icon alternatives', () => {
    const { html, text } = renderOrderEmail(confirmation, orderFixture(), { assetBaseUrl: `${assetBaseUrl}/` })
    expect(new Set(links(html))).toEqual(new Set(['monogram', 'receipt', 'package', 'heart', 'paw'].map(name => `${assetBaseUrl}/${name}.png`)))
    expect(html).toContain(`background="${assetBaseUrl}/monogram.png"`)
    for (const tag of html.match(/<img\b[^>]*>/g)) {
      expect(tag).toContain('width="22" height="22"')
      expect(tag).toContain('alt="" role="presentation"')
    }
    expect(text).not.toContain(assetBaseUrl)
    expect(html).not.toMatch(/<svg|data:image|@font-face|<script|<link|<iframe|<object|\.woff|\.webp/i)
  })

  it('accepts an HTTPS origin without a path and keeps every asset on that origin', () => {
    const { html } = renderOrderEmail(confirmation, orderFixture(), { assetBaseUrl: 'https://shop.example.com' })
    expect(links(html)).toContain('https://shop.example.com/monogram.png')
    expect(links(html)).toContain('https://shop.example.com/receipt.png')
    for (const url of links(html)) expect(new URL(url).origin).toBe('https://shop.example.com')
  })

  it.each([
    undefined, null, {}, '', '/email-assets', 'http://shop.example.com', '//shop.example.com',
    'https://name:password@shop.example.com/email-assets', 'https://name@shop.example.com',
    'https://shop.example.com/email-assets?token=private', 'https://shop.example.com/email-assets#proof',
    'https://shop.example.com/email-assets?', 'https://shop.example.com/email-assets#',
    'https://shop.example.com/\nassets', 'https://shop.example.com\\@evil.example.com', 'javascript:alert(1)',
  ])('falls back to the complete image-free receipt for invalid asset base: %s', base => {
    const rendered = renderOrderEmail(confirmation, orderFixture(), { assetBaseUrl: base })
    expect(rendered.html).not.toMatch(/<img\b|\bbackground="https:/)
    expect(rendered.text).toContain('Order total: $55.05')
    expect(rendered.html).toContain('Your order')
    expect(rendered.html).toContain('Shipping to')
  })

  it('escapes asset-path quotes without creating attributes or CSS dependencies', () => {
    const { html } = renderOrderEmail(confirmation, orderFixture(), { assetBaseUrl: 'https://shop.example.com/a\'b"c' })
    for (const url of links(html)) {
      expect(url).toMatch(/^https:\/\/shop\.example\.com\/a&#039;b%22c\/(?:monogram|receipt|package|heart|paw)\.png$/)
    }
    expect(html).not.toMatch(/url\(|\bonerror=/)
  })

  it('does not choose asset origins from process configuration', () => {
    vi.stubEnv('CLIENT_URL', 'https://ignored.example.com')
    vi.stubEnv('FRONTEND_URL', 'https://also-ignored.example.com')
    try {
      const { html } = renderOrderEmail(confirmation, orderFixture(), null)
      expect(links(html)).toEqual([])
    } finally { vi.unstubAllEnvs() }
  })

  it('provides fluid, constrained table layout, Outlook fallback and narrow-screen spacing', () => {
    const { html } = renderOrderEmail(confirmation, orderFixture(), { assetBaseUrl })
    expect(html).toContain('name="viewport" content="width=device-width, initial-scale=1"')
    expect(html).toContain('width:100%;max-width:640px')
    expect(html).toContain('<!--[if mso]><table role="presentation" width="640"')
    expect(html).toContain('@media only screen and (max-width:480px)')
    expect(html).toContain('padding-left:20px !important')
    expect(html).toContain('overflow-wrap:anywhere;word-break:break-word')
    for (const label of ['Order items', 'Order totals']) {
      expect(table(html, label)).toContain('table-layout:fixed')
      expect(table(html, label)).not.toContain('role="presentation"')
    }
    expect(html).toContain('scope="col"')
    expect(html).toContain('scope="row"')
    expect(html).not.toMatch(/display:(?:flex|grid)|animation:|transition:|white-space:nowrap/)
    expect(html.length).toBeLessThan(95000)
    const withoutHead = html.replace(/<head>[\s\S]*?<\/head>/, '')
    expect(withoutHead).toContain('font-size:16px;line-height:26px')
    expect(table(withoutHead, 'Order totals')).toContain('$55.05')
  })

  it('keeps long unbroken content intact without fixed-height text containers', () => {
    const long = 'FictionalLongName'.repeat(30)
    const { html, text } = renderOrderEmail(confirmation, orderFixture({ customerName: long, customerReference: long, address1: long, items: [{ productName: long, size: long, quantity: 1, unitPrice: 10, lineTotal: 10 }] }))
    expect(html).toContain(long)
    expect(text).toContain(long)
    expect(html).toContain('table-layout:fixed;overflow-wrap:anywhere;word-break:break-word')
    expect(html).not.toMatch(/text-overflow:ellipsis|overflow:hidden|max-height:/)
  })

  it('never falls back to internal IDs or serializes private fields into either output', () => {
    const privateValues = {
      id: 'internal-order-canary', userId: 'internal-user-canary', stripePaymentIntentId: 'payment-canary',
      receiptAccess: 'receipt-proof-canary', checkoutProof: 'checkout-proof-canary', sessionToken: 'session-canary',
      adminNotes: 'admin-note-canary', metadata: { provider: 'provider-canary' },
    }
    const rendered = renderOrderEmail(confirmation, orderFixture({ ...privateValues, customerReference: undefined, orderNumber: undefined }))
    const output = JSON.stringify(rendered)
    for (const value of ['internal-order-canary', 'internal-user-canary', 'payment-canary', 'receipt-proof-canary', 'checkout-proof-canary', 'session-canary', 'admin-note-canary', 'provider-canary']) expect(output).not.toContain(value)
    expect(output).not.toContain('undefined')
  })
})
