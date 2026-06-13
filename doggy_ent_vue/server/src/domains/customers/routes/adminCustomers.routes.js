import express from 'express'
import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'
import {
  deactivateAdminCustomerController,
  getAdminCustomerController,
  getAdminCustomersController,
  queueCustomerPasswordResetController,
  queueCustomerVerificationController,
  reactivateAdminCustomerController,
} from '../controllers/adminCustomers.controller.js'

const router = express.Router()

router.use(requireAdminAuth)

router.get('/', getAdminCustomersController)
router.get('/:customerId', getAdminCustomerController)
router.post('/:customerId/deactivate', deactivateAdminCustomerController)
router.post('/:customerId/reactivate', reactivateAdminCustomerController)
router.post('/:customerId/resend-verification', queueCustomerVerificationController)
router.post('/:customerId/password-reset', queueCustomerPasswordResetController)

export default router
