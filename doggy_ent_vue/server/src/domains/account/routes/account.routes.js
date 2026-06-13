import express from 'express'
import {
  requireCustomerAuth,
} from '../../../app/middleware/auth/requireCustomerAuth.js'
import {
  getAccountDashboardController,
  getAccountOrderController,
  getAccountOrdersController,
  getAccountProfileController,
  updateAccountProfileController,
} from '../controllers/account.controller.js'

const router = express.Router()

router.use(requireCustomerAuth)

router.get('/', getAccountDashboardController)
router.get('/profile', getAccountProfileController)
router.put('/profile', updateAccountProfileController)
router.get('/orders', getAccountOrdersController)
router.get('/orders/:reference', getAccountOrderController)

export default router
