const PRODUCTS_API_BASE = '/api/products'

function normalizeVariant(product, variant) {
  return {
    ...variant,
    price: Number(variant.price || 0) / 100,
    quantity: Number(variant.inventory || 0),
    stockStatus:
      Number(variant.inventory || 0) > 0
        ? 'in-stock'
        : product.status === 'COMING_SOON'
          ? 'coming-soon'
          : 'out-of-stock',
  }
}

function normalizeProduct(product) {
  return {
    ...product,
    shortDescription: product.description || '',
    status: String(product.status || '').toLowerCase().replace(/_/g, '-'),
    sellingMode: String(product.sellingMode || '').toLowerCase().replace(/_/g, '-'),
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => normalizeVariant(product, variant))
      : [],
  }
}

export async function fetchProducts() {
  const response = await fetch(PRODUCTS_API_BASE)

  if (!response.ok) {
    throw new Error(`Products request failed with status ${response.status}`)
  }

  const data = await response.json()

  const products = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : []

  return products.map(normalizeProduct)
}

export async function fetchProductBySlug(slug) {
  const response = await fetch(`${PRODUCTS_API_BASE}/${slug}`)

  if (!response.ok) {
    throw new Error(`Product request failed with status ${response.status}`)
  }

  const product = await response.json()

  return normalizeProduct(product)
}