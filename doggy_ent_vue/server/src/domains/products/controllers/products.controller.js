import {
  createProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductBySlug,
  updateProductById,
} from '../services/products.service.js'
import {
  validateProductPayload,
} from '../validators/products.validator.js'

function sendProductValidationError(req, res) {
  const validationError = validateProductPayload(req.body)

  if (!validationError) {
    return false
  }

  res.status(validationError.statusCode).json({
    message: validationError.message,
  })

  return true
}

export async function getAllProducts(req, res, next) {
  try {
    const products = await fetchAllProducts()
    res.json(products)
  } catch (error) {
    next(error)
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params

    const product = await fetchProductBySlug(slug)

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

export async function createNewProduct(req, res, next) {
  try {
    if (sendProductValidationError(req, res)) return

    const createdProduct = await createProduct(req.body)
    res.status(201).json(createdProduct)
  } catch (error) {
    next(error)
  }
}

export async function updateExistingProduct(req, res, next) {
  try {
    if (sendProductValidationError(req, res)) return

    const { id } = req.params
    const updatedProduct = await updateProductById(id, req.body)

    if (!updatedProduct) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    res.json(updatedProduct)
  } catch (error) {
    next(error)
  }
}

export async function deleteExistingProduct(req, res, next) {
  try {
    const { id } = req.params
    const deletedProduct = await deleteProductById(id)

    if (!deletedProduct) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    res.json({
      message: `Product "${deletedProduct.name}" deleted successfully.`,
      deletedProduct,
    })
  } catch (error) {
    next(error)
  }
}
