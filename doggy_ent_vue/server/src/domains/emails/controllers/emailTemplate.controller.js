import { getEmailTemplates, saveEmailTemplate, previewEmailTemplate, sendEmailTemplate } from '../services/emailTemplate.service.js'
const respond = handler => async (req, res, next) => { try { res.set('Cache-Control', 'no-store'); res.json({ success: true, result: await handler(req) }) } catch (error) { next(error) } }
export const getTemplates = respond(() => getEmailTemplates())
export const postTemplate = respond(req => saveEmailTemplate(null, req.body))
export const putTemplate = respond(req => saveEmailTemplate(req.params.id, req.body))
export const postPreview = respond(req => previewEmailTemplate(req.params.id, req.body, req.admin.email))
export const postSend = respond(req => sendEmailTemplate(req.params.id, req.body, req.admin.email))
