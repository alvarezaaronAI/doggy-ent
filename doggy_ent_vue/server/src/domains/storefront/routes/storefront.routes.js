import { Router } from 'express'
import { requireAdminAuth } from '../../../app/middleware/auth/requireAdminAuth.js'
import { adminContent, publicContent, publishContent, saveDraft } from '../controllers/storefront.controller.js'
const router = Router()
router.get('/storefront/content', publicContent)
router.get('/admin/storefront', requireAdminAuth, adminContent)
router.put('/admin/storefront/draft', requireAdminAuth, saveDraft)
router.put('/admin/storefront/publish', requireAdminAuth, publishContent)
export default router
