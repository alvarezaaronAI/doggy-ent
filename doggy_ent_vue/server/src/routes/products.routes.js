import { Router } from 'express'
import {
  createNewProduct,
  deleteExistingProduct,
  getAllProducts,
} from '../controllers/products.controller.js'

const router = Router()

router.get('/', getAllProducts)
router.post('/', createNewProduct)
router.delete('/:id', deleteExistingProduct)

export default router
