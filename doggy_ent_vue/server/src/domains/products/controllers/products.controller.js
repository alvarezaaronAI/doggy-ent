import {
  createProduct,
  deleteProductById,
  fetchAllProducts,
  fetchProductBySlug,
  updateProductById,
} from '../services/products.service.js'

function validateProductPayload(req, res) {
  const {
    name,
    shortDescription,
    category,
    status,
    image,
    variants,
  } = req.body

  const hasVariantPrices =
    Array.isArray(variants) &&
    variants.length >= 2 &&
    variants.every((variant) => Number(variant.price) > 0)

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
