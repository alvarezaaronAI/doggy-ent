let mockProducts = [
  {
    id: 'chicken-breast-jerky',
    name: 'Chicken Breast Jerky',
    shortDescription: 'Lean, hand-sliced chicken breast dehydrated low and slow.',
    price: 12.99,
    category: 'Jerky',
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'taste-test-trio',
    name: 'Taste Test Trio',
    shortDescription: 'Three small bags for picky pups and first-time buyers.',
    price: 29.99,
    category: 'Bundle',
    status: 'draft',
    featured: false,
    image: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'big-lab-bundle',
    name: 'Big Lab Bundle',
    shortDescription: 'A larger bundle for multi-dog homes and bigger snackers.',
    price: 59.99,
    category: 'Bundle',
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
  },
]

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function fetchAllProducts() {
  return mockProducts
}

export async function createProduct(productInput) {
  const idBase = slugify(productInput.name || 'product')
  const duplicateCount = mockProducts.filter((product) => product.id.startsWith(idBase)).length
  const id = duplicateCount > 0 ? `${idBase}-${duplicateCount + 1}` : idBase

  const newProduct = {
    id,
    name: productInput.name,
    shortDescription: productInput.shortDescription,
    price: Number(productInput.price),
    category: productInput.category,
    status: productInput.status,
    featured: Boolean(productInput.featured),
    image: productInput.image,
  }

  mockProducts.unshift(newProduct)
  return newProduct
}

export async function deleteProductById(productId) {
  const existingIndex = mockProducts.findIndex((product) => product.id === productId)

  if (existingIndex === -1) {
    return null
  }

  const deletedProducts = mockProducts.splice(existingIndex, 1)
  return deletedProducts[0]
}
