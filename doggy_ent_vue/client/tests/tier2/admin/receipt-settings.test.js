import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import AdminCheckoutReceiptSettings from '../../../src/domains/admin/components/AdminCheckoutReceiptSettings.vue'
import { receiptEmailMessage } from '../../../src/domains/checkout/utils/receiptEmail.js'
async function render(props) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { render: () => null } }] })
  await router.push('/')
  return renderToString(createSSRApp(AdminCheckoutReceiptSettings, props).use(router))
}
describe('checkout receipt controls and customer reassurance', () => {
  it('defaults to off, explains test/live and keeps other emails manual', async () => {
    const html = await render({})
    for (const text of ['After checkout', 'Test only', 'no email sent', 'other updates stay manual', 'Live sending is locked', 'Save receipt settings', 'Payment confirmation']) expect(html.toLowerCase()).toContain(text.toLowerCase())
    expect(html).toContain('value="LIVE" disabled'); expect(html).toContain('Add Payment confirmation to My templates')
  })
  it('only offers saved, active payment templates and keeps unsaved content separate', async () => {
    const templates = [{ id: 'payment', name: 'Approved payment copy', event: 'ORDER_CONFIRMATION' }, { id: 'shipping', name: 'Wrong event', event: 'ORDER_SHIPPED' }, { id: 'archived', name: 'Archived copy', event: 'ORDER_CONFIRMATION', archived: true }, { id: 'suggested', name: 'Unsaved suggestion', event: 'ORDER_CONFIRMATION', suggested: true }]
    const html = await render({ templates, templateDirty: true, settings: { mode: 'DRY_RUN', templateId: 'payment', revision: 1 } })
    expect(html).toContain('Approved payment copy'); expect(html).toContain('Save or cancel your template')
    for (const name of ['Wrong event', 'Archived copy', 'Unsaved suggestion']) expect(html).not.toContain(name)
  })
  it('never claims mocked, queued, failed or unknown mail was delivered', () => {
    expect(receiptEmailMessage('MOCKED')).toContain('No email was sent')
    expect(receiptEmailMessage('QUEUED')).toContain('queued')
    expect(receiptEmailMessage('PENDING')).toContain('not confirmed')
    expect(receiptEmailMessage('FAILED')).toContain('do not pay again')
    expect(receiptEmailMessage('SENT')).toContain('accepted by our email provider')
    for (const status of ['MOCKED', 'QUEUED', 'PENDING', 'FAILED', undefined]) expect(receiptEmailMessage(status)).not.toMatch(/receipt was.*delivered|email has been delivered/i)
  })
})
