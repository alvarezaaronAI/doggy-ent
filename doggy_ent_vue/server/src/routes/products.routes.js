import { Router } from 'express'
import {
  createNewProduct,
  getAllProducts,
} from '../controllers/products.controller.js'

const router = Router()

router.get('/', getAllProducts)
router.post('/', createNewProduct)

export default router
