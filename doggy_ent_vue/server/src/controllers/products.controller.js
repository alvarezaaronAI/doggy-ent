import {
  createProduct,
  deleteProductById,
  fetchAllProducts,
  updateProductById,
} from '../services/products.service.js'

function validateProductPayload(req, res) {
  const {
    name,
    shortDescription,
    category,
    status,
    image,
    sixOzPrice,
    eighteenOzPrice,
    variants,
  } = req.body

  const hasVariantPrices =
    (sixOzPrice && eighteenOzPrice) ||
    (Array.isArray(variants) && variants.length >= 2)

  if (!name || !shortDescription || !category || !status || !image || !hasVariantPrices) {
    res.status(400).json({
      message: 'Missing required product fields or variant prices.',
    })
    return false
  }

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

export async function createNewProduct(req, res, next) {
  try {
    if (!validateProductPayload(req, res)) return

    const createdProduct = await createProduct(req.body)
    res.status(201).json(createdProduct)
  } catch (error) {
    next(error)
  }
}

export async function updateExistingProduct(req, res, next) {
  try {
    if (!validateProductPayload(req, res)) return

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
