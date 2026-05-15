import { Router } from 'express'
import {
  createNewProduct,
  deleteExistingProduct,
  getAllProducts,
  updateExistingProduct,
} from '../controllers/products.controller.js'
import { requireAdminAuth } from '../../../app/middleware/auth/requireAdminAuth.js'

const router = Router()

router.get('/', getAllProducts)
router.post('/', requireAdminAuth, createNewProduct)
router.put('/:id', requireAdminAuth, updateExistingProduct)
router.delete('/:id', requireAdminAuth, deleteExistingProduct)

export default router
