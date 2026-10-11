import { ORDER_EMAIL_EVENTS, TEMPLATE_PLACEHOLDERS } from '../constants/orderEmailTemplates.constants.js'
export function validateEmailTemplate(input = {}) {
  const output = {}
  for (const [field, max] of [['name', 100], ['subject', 200], ['heading', 200], ['body', 4000], ['footer', 1000]]) {
    const value = typeof input[field] === 'string' ? input[field].trim() : ''
    if (!value || value.length > max || /[<>\u0000]/.test(value) || (['subject', 'name', 'heading'].includes(field) && /[\r\n]/.test(value))) throw Object.assign(new Error('Check the template ' + field + '.'), { statusCode: 400 })
    for (const match of value.matchAll(/{{\s*([^{}]+)\s*}}/g)) if (!TEMPLATE_PLACEHOLDERS.includes(match[1].trim())) throw Object.assign(new Error('Unsupported email placeholder.'), { statusCode: 400 })
    if (/[{}]/.test(value.replace(/{{\s*(customerName|orderReference|orderStatus)\s*}}/g, ''))) throw Object.assign(new Error('Check the email placeholders.'), { statusCode: 400 })
    output[field] = value
  }
  if (!ORDER_EMAIL_EVENTS.includes(input.event)) throw Object.assign(new Error('Choose a supported order email type.'), { statusCode: 400 })
  if (input.archived !== undefined && typeof input.archived !== 'boolean') throw Object.assign(new Error('Invalid archive setting.'), { statusCode: 400 })
  return { ...output, event: input.event, archived: input.archived === true }
}
