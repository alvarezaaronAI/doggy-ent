import { prisma } from '../../../db/prisma.js'
import {
  buildProductMutationData,
  mapProductWithDisplayPrice,
  normalizeProductInput,
} from '../mappers/products.mapper.js'
import {
  normalizeInventoryQuantity,
} from '../utils/products.utils.js'

export async function fetchAllProducts() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map(mapProductWithDisplayPrice)
}

export async function fetchProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      variants: true,
    },
  })

  if (!product) {
    return null
  }

  return mapProductWithDisplayPrice(product)
}

export async function createProduct(productInput) {
  const normalizedProduct = normalizeProductInput(productInput)

  const createdProduct = await prisma.product.create({
    data: buildProductMutationData(normalizedProduct),
    include: {
      variants: true,
    },
  })

  return mapProductWithDisplayPrice(createdProduct)
}

export async function updateProductById(productId, productInput) {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      variants: true,
    },
  })

  if (!existingProduct) {
    return null
  }

  const normalizedProduct = normalizeProductInput(productInput)

  await prisma.productVariant.deleteMany({
    where: {
      productId,
    },
  })

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: buildProductMutationData(normalizedProduct),
    include: {
      variants: true,
    },
  })

  return mapProductWithDisplayPrice(updatedProduct)
}

export async function decrementProductInventory({
  items = [],
}) {
  for (const item of items) {
    const quantityToRemove = normalizeInventoryQuantity(
      item.quantity,
    )

    if (!quantityToRemove) {
      continue
    }

    const sku = item.variant?.sku || item.sku

    if (!sku) {
      continue
    }

    const variant = await prisma.productVariant.findUnique({
      where: {
        sku,
      },
    })

    if (!variant) {
      throw new Error(
        `Variant not found for SKU: ${sku}`,
      )
    }

    if (variant.inventory < quantityToRemove) {
      throw new Error(
        `Insufficient inventory for SKU: ${sku}`,
      )
    }

    await prisma.productVariant.update({
      where: {
        sku,
      },

      data: {
        inventory: {
          decrement: quantityToRemove,
        },
      },
    })
  }
}

export async function deleteProductById(productId) {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  })

  if (!existingProduct) {
    return null
  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  })

  return existingProduct
}
