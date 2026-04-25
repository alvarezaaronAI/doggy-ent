import { Router } from 'express'
import {
  createNewProduct,
  deleteExistingProduct,
  getAllProducts,
  updateExistingProduct,
} from '../controllers/products.controller.js'

const router = Router()

router.get('/', getAllProducts)
router.post('/', createNewProduct)
router.put('/:id', updateExistingProduct)
router.delete('/:id', deleteExistingProduct)

export default router
