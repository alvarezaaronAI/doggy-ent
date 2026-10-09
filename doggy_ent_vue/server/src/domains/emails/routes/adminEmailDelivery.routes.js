import express from 'express'
import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'
import {
  getAdminEmailDeliveriesController,
} from '../controllers/emailDelivery.controller.js'

const router = express.Router()

router.use(requireAdminAuth)

router.get('/', getAdminEmailDeliveriesController)

export default router
