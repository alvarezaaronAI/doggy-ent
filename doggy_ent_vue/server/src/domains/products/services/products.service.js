import { prisma } from '../../../db/prisma.js'

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function normalizeProductInput(productInput) {
  const tags = Array.isArray(productInput.tags)
    ? productInput.tags
    : String(productInput.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

  const notIncluded = Array.isArray(productInput.notIncluded)
    ? productInput.notIncluded
    : String(productInput.notIncluded || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

  const sixOzPrice = Number(productInput.sixOzPrice ?? productInput.variants?.[0]?.price ?? 0)
  const eighteenOzPrice = Number(productInput.eighteenOzPrice ?? productInput.variants?.[1]?.price ?? 0)

  const sixOzQuantity = Number(productInput.sixOzQuantity ?? productInput.variants?.[0]?.quantity ?? 0)
  const eighteenOzQuantity = Number(productInput.eighteenOzQuantity ?? productInput.variants?.[1]?.quantity ?? 0)
  const sixOzLowStockThreshold = Number(productInput.sixOzLowStockThreshold ?? productInput.variants?.[0]?.lowStockThreshold ?? 5)
  const eighteenOzLowStockThreshold = Number(productInput.eighteenOzLowStockThreshold ?? productInput.variants?.[1]?.lowStockThreshold ?? 3)

  const getStockStatus = (quantity, incomingStatus) => {
    if (incomingStatus === 'coming-soon') return 'coming-soon'
    if (quantity <= 0) return 'out-of-stock'
    return 'in-stock'
  }

  return {
    name: productInput.name,
    protein: productInput.protein || '',
    cut: productInput.cut || '',
    shortDescription: productInput.shortDescription,
    category: productInput.category,
    status: productInput.status,
    sellingMode: productInput.sellingMode || 'inventory-limited',
    featured: Boolean(productInput.featured),
    tags,
    image: productInput.image,
    ingredients: productInput.ingredients || `${productInput.protein || 'Protein'}. No salt, no sugar, no glycerin, no preservatives.`,
    texture: productInput.texture || 'Firm jerky texture that can be broken into smaller pieces.',
    bestFor: productInput.bestFor || 'Training rewards, bigger dogs, picky pups, and simple-ingredient routines.',
    notIncluded,
    freshness: productInput.freshness || 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
    storageFeeding: productInput.storageFeeding || 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    showGuaranteedAnalysis: Boolean(productInput.showGuaranteedAnalysis),
    variants: [
      {
        size: '6 oz',
        price: sixOzPrice,
        sku: productInput.sixOzSku || `CNE-DT-${slugify(productInput.protein || productInput.name).toUpperCase()}-6OZ`,
        quantity: sixOzQuantity,
        stockStatus: getStockStatus(sixOzQuantity, productInput.sixOzStockStatus || productInput.variants?.[0]?.stockStatus),
        lowStockThreshold: sixOzLowStockThreshold,
      },
      {
        size: '18 oz',
        price: eighteenOzPrice,
        sku: productInput.eighteenOzSku || `CNE-DT-${slugify(productInput.protein || productInput.name).toUpperCase()}-18OZ`,
        quantity: eighteenOzQuantity,
        stockStatus: getStockStatus(eighteenOzQuantity, productInput.eighteenOzStockStatus || productInput.variants?.[1]?.stockStatus),
        lowStockThreshold: eighteenOzLowStockThreshold,
      },
    ],
    guaranteedAnalysis: productInput.showGuaranteedAnalysis
      ? productInput.guaranteedAnalysis || {
          crudeProteinMin: productInput.crudeProteinMin || '',
          crudeFatMin: productInput.crudeFatMin || '',
          crudeFiberMax: productInput.crudeFiberMax || '',
          moistureMax: productInput.moistureMax || '',
        }
      : {},
  }
}

export async function fetchAllProducts() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map((product) => ({
    ...product,
    price: product.variants?.[0]?.price
      ? product.variants[0].price / 100
      : 0,
  }))
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

  return {
    ...product,
    price: product.variants?.[0]?.price
      ? product.variants[0].price / 100
      : 0,
  }
}

export async function createProduct(productInput) {
  const normalizedProduct = normalizeProductInput(productInput)

  const createdProduct = await prisma.product.create({
    data: {
      name: normalizedProduct.name,
      slug: slugify(normalizedProduct.name),
      description: normalizedProduct.shortDescription,
      protein: normalizedProduct.protein,
      cut: normalizedProduct.cut,
      category: normalizedProduct.category,
      image: normalizedProduct.image,
      ingredients: normalizedProduct.ingredients,
      texture: normalizedProduct.texture,
      bestFor: normalizedProduct.bestFor,
      freshness: normalizedProduct.freshness,
      storageFeeding: normalizedProduct.storageFeeding,
      featured: normalizedProduct.featured,
      sellingMode: normalizedProduct.sellingMode?.toUpperCase().replace(/-/g, '_'),
      tags: normalizedProduct.tags,
      status: normalizedProduct.status?.toUpperCase().replace(/-/g, '_'),
      variants: {
        create: normalizedProduct.variants.map((variant) => ({
          size: variant.size,
          price: Math.round(Number(variant.price) * 100),
          inventory: variant.quantity,
          sku: variant.sku,
        })),
      },
    },
    include: {
      variants: true,
    },
  })

  return {
    ...createdProduct,
    price: createdProduct.variants?.[0]?.price
      ? createdProduct.variants[0].price / 100
      : 0,
  }
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
    data: {
      name: normalizedProduct.name,
      slug: slugify(normalizedProduct.name),
      description: normalizedProduct.shortDescription,
      protein: normalizedProduct.protein,
      cut: normalizedProduct.cut,
      category: normalizedProduct.category,
      image: normalizedProduct.image,
      ingredients: normalizedProduct.ingredients,
      texture: normalizedProduct.texture,
      bestFor: normalizedProduct.bestFor,
      freshness: normalizedProduct.freshness,
      storageFeeding: normalizedProduct.storageFeeding,
      featured: normalizedProduct.featured,
      sellingMode: normalizedProduct.sellingMode?.toUpperCase().replace(/-/g, '_'),
      tags: normalizedProduct.tags,
      status: normalizedProduct.status?.toUpperCase().replace(/-/g, '_'),
      variants: {
        create: normalizedProduct.variants.map((variant) => ({
          size: variant.size,
          price: Math.round(Number(variant.price) * 100),
          inventory: variant.quantity,
          sku: variant.sku,
        })),
      },
    },
    include: {
      variants: true,
    },
  })

  return {
    ...updatedProduct,
    price: updatedProduct.variants?.[0]?.price
      ? updatedProduct.variants[0].price / 100
      : 0,
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
