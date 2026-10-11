import express from 'express'
import { requireAdminAuth } from '../../../app/middleware/auth/requireAdminAuth.js'
import { createRateLimiter } from '../../../app/middleware/security/rateLimit.middleware.js'
import { getTemplates, postTemplate, putTemplate, postPreview, postSend } from '../controllers/emailTemplate.controller.js'
const router = express.Router()
router.use(requireAdminAuth)
router.get('/', getTemplates)
router.post('/', postTemplate)
router.put('/:id', putTemplate)
router.post('/:id/preview', postPreview)
router.post('/:id/send', createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000, message: 'Too many email send requests. Please wait before sending again.' }), postSend)
export default router
