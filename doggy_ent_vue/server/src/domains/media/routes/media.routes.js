import { Router, raw } from 'express'
import { requireAdminAuth } from '../../../app/middleware/auth/requireAdminAuth.js'
import { createRateLimiter } from '../../../app/middleware/security/rateLimit.middleware.js'
import { IMAGE_UPLOAD_TYPES, MAX_IMAGE_UPLOAD_BYTES } from '../../storefront/content/mediaRules.js'
import { details, image, library, upload } from '../controllers/media.controller.js'
const router = Router()
const uploadLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many image uploads. Please try again shortly.' })
router.get('/media/:id', image)
router.get('/media/:id/thumbnail', image)
router.get('/admin/media', requireAdminAuth, library)
router.post('/admin/media', requireAdminAuth, uploadLimiter, raw({ type: IMAGE_UPLOAD_TYPES, limit: MAX_IMAGE_UPLOAD_BYTES, inflate: false }), upload)
router.patch('/admin/media/:id', requireAdminAuth, details)
router.use((error, _req, res, next) => {
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Images must be 8 MB or smaller.' })
  if (error.type === 'encoding.unsupported') return res.status(415).json({ message: 'Compressed upload requests are not supported.' })
  return next(error)
})
export default router
