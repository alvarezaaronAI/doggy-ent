import express from 'express'
import petsRoutes from '../../pets/routes/pets.routes.js'
import {
  requireCustomerAuth,
} from '../../../app/middleware/auth/requireCustomerAuth.js'
import {
  getAccountDashboardController,
  getAccountNotificationsController,
  getAccountOrderController,
  getAccountOrdersController,
  getAccountProfileController,
  updateAccountProfileController,
} from '../controllers/account.controller.js'

const router = express.Router()

router.use(requireCustomerAuth)
router.use('/pets', petsRoutes)

router.get('/', getAccountDashboardController)
router.get('/profile', getAccountProfileController)
router.put('/profile', updateAccountProfileController)
router.get('/notifications', getAccountNotificationsController)
router.get('/orders', getAccountOrdersController)
router.get('/orders/:reference', getAccountOrderController)

export default router
