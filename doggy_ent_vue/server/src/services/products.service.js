let mockProducts = [
  {
    id: 'chicken-breast-jerky',
    name: 'Chicken Breast Jerky',
    protein: 'Chicken',
    cut: 'Breast',
    shortDescription: 'Lean, hand-sliced chicken breast dehydrated low and slow.',
    category: 'Jerky',
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Chicken breast. No salt, no sugar, no glycerin, no preservatives.',
    variants: [
      {
        size: '6 oz',
        price: 14.99,
        sku: 'CNE-DT-CHICKEN-6OZ',
      },
      {
        size: '18 oz',
        price: 39.99,
        sku: 'CNE-DT-CHICKEN-18OZ',
      },
    ],
    guaranteedAnalysis: {
      crudeProteinMin: '70%',
      crudeFatMin: '4.5%',
      crudeFiberMax: '0.5%',
      moistureMax: '20%',
    },
  },
  {
    id: 'beef-jerky',
    name: 'Beef Jerky',
    protein: 'Beef',
    cut: 'Lean Cut',
    shortDescription: 'Rich beef jerky made for bigger dogs who love a stronger flavor.',
    category: 'Jerky',
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Beef. No salt, no sugar, no glycerin, no preservatives.',
    variants: [
      {
        size: '6 oz',
        price: 17.99,
        sku: 'CNE-DT-BEEF-6OZ',
      },
      {
        size: '18 oz',
        price: 47.99,
        sku: 'CNE-DT-BEEF-18OZ',
      },
    ],
    guaranteedAnalysis: {
      crudeProteinMin: '68%',
      crudeFatMin: '6%',
      crudeFiberMax: '1%',
      moistureMax: '20%',
    },
  },
  {
    id: 'turkey-jerky',
    name: 'Turkey Jerky',
    protein: 'Turkey',
    cut: 'Breast',
    shortDescription: 'A lighter protein option with a clean, simple ingredient list.',
    category: 'Jerky',
    status: 'draft',
    featured: false,
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Turkey breast. No salt, no sugar, no glycerin, no preservatives.',
    variants: [
      {
        size: '6 oz',
        price: 16.99,
        sku: 'CNE-DT-TURKEY-6OZ',
      },
      {
        size: '18 oz',
        price: 44.99,
        sku: 'CNE-DT-TURKEY-18OZ',
      },
    ],
    guaranteedAnalysis: {
      crudeProteinMin: '69%',
      crudeFatMin: '4%',
      crudeFiberMax: '0.5%',
      moistureMax: '20%',
    },
  },
  {
    id: 'lamb-jerky',
    name: 'Lamb Jerky',
    protein: 'Lamb',
    cut: 'Lean Cut',
    shortDescription: 'A premium lamb treat option for dogs who love richer proteins.',
    category: 'Jerky',
    status: 'draft',
    featured: false,
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Lamb. No salt, no sugar, no glycerin, no preservatives.',
    variants: [
      {
        size: '6 oz',
        price: 22.99,
        sku: 'CNE-DT-LAMB-6OZ',
      },
      {
        size: '18 oz',
        price: 59.99,
        sku: 'CNE-DT-LAMB-18OZ',
      },
    ],
    guaranteedAnalysis: {
      crudeProteinMin: '65%',
      crudeFatMin: '8%',
      crudeFiberMax: '1%',
      moistureMax: '20%',
    },
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

function normalizeProductInput(productInput) {
  const sixOzPrice = Number(productInput.sixOzPrice || productInput.variants?.[0]?.price || 0)
  const eighteenOzPrice = Number(productInput.eighteenOzPrice || productInput.variants?.[1]?.price || 0)

  return {
    name: productInput.name,
    protein: productInput.protein || '',
    cut: productInput.cut || '',
    shortDescription: productInput.shortDescription,
    category: productInput.category,
    status: productInput.status,
    featured: Boolean(productInput.featured),
    image: productInput.image,
    ingredients: productInput.ingredients || `${productInput.protein || 'Protein'}. No salt, no sugar, no glycerin, no preservatives.`,
    variants: [
      {
        size: '6 oz',
        price: sixOzPrice,
        sku: productInput.sixOzSku || `CNE-DT-${slugify(productInput.protein || productInput.name).toUpperCase()}-6OZ`,
      },
      {
        size: '18 oz',
        price: eighteenOzPrice,
        sku: productInput.eighteenOzSku || `CNE-DT-${slugify(productInput.protein || productInput.name).toUpperCase()}-18OZ`,
      },
    ],
    guaranteedAnalysis: productInput.guaranteedAnalysis || {
      crudeProteinMin: productInput.crudeProteinMin || '70%',
      crudeFatMin: productInput.crudeFatMin || '4.5%',
      crudeFiberMax: productInput.crudeFiberMax || '0.5%',
      moistureMax: productInput.moistureMax || '20%',
    },
  }
}

export async function fetchAllProducts() {
  return mockProducts.map((product) => ({
    ...product,
    price: product.variants?.[0]?.price || 0,
  }))
}

export async function createProduct(productInput) {
  const idBase = slugify(productInput.name || 'product')
  const duplicateCount = mockProducts.filter((product) => product.id.startsWith(idBase)).length
  const id = duplicateCount > 0 ? `${idBase}-${duplicateCount + 1}` : idBase

  const newProduct = {
    id,
    ...normalizeProductInput(productInput),
  }

  mockProducts.unshift(newProduct)

  return {
    ...newProduct,
    price: newProduct.variants?.[0]?.price || 0,
  }
}

export async function updateProductById(productId, productInput) {
  const existingIndex = mockProducts.findIndex((product) => product.id === productId)

  if (existingIndex === -1) {
    return null
  }

  const existingProduct = mockProducts[existingIndex]

  const updatedProduct = {
    ...existingProduct,
    ...normalizeProductInput(productInput),
  }

  mockProducts[existingIndex] = updatedProduct

  return {
    ...updatedProduct,
    price: updatedProduct.variants?.[0]?.price || 0,
  }
}

export async function deleteProductById(productId) {
  const existingIndex = mockProducts.findIndex((product) => product.id === productId)

  if (existingIndex === -1) {
    return null
  }

  const deletedProducts = mockProducts.splice(existingIndex, 1)
  return deletedProducts[0]
}
