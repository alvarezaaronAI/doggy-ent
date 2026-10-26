import { fetchApi, parseJsonResponse } from '@shared/api/http.js'
const endpoint = '/api/admin/email-templates'
async function request(path = '', method = 'GET', payload) {
  const data = await parseJsonResponse(await fetchApi(endpoint + path, { method, ...(payload ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {}) }), 'Unable to process email templates.')
  if (!data.success) throw new Error(data.message || 'Unable to process email templates.')
  return data.result
}
export const fetchEmailTemplates = () => request()
export const saveCheckoutReceiptSettings = settings => request('/checkout-receipt', 'PUT', settings)
export const saveEmailTemplate = template => request(template.suggested ? '' : '/' + encodeURIComponent(template.id), template.suggested ? 'POST' : 'PUT', template)
export const previewEmailTemplate = (id, payload = {}) => request('/' + encodeURIComponent(id) + '/preview', 'POST', payload)
export const sendOrderEmail = (id, payload) => request('/' + encodeURIComponent(id) + '/send', 'POST', payload)
