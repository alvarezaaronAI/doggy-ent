import {
  createProduct,
  deleteProductById,
  fetchAllProducts,
} from '../services/products.service.js'

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
    const {
      name,
      shortDescription,
      price,
      category,
      status,
      featured,
      image,
    } = req.body

    if (!name || !shortDescription || !price || !category || !status || !image) {
      return res.status(400).json({
        message: 'Missing required product fields.',
      })
    }

    const createdProduct = await createProduct({
      name,
      shortDescription,
      price,
      category,
      status,
      featured,
      image,
    })

    res.status(201).json(createdProduct)
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
