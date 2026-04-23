import { createProduct, fetchAllProducts } from '../services/products.service.js'

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
