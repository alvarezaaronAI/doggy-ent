let mockProducts = [
  {
    id: 'chicken-breast-jerky',
    name: 'Chicken Breast Jerky',
    protein: 'Chicken',
    cut: 'Breast',
    shortDescription: 'Lean, hand-sliced chicken breast dehydrated low and slow.',
    category: 'Jerky',
    status: 'active',
    sellingMode: 'made-to-order',
    featured: true,
    tags: ['Single-ingredient', 'Grain-free'],
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Chicken breast. No salt, no sugar, no glycerin, no preservatives.',
    texture: 'Firm jerky texture that can be broken into smaller pieces.',
    bestFor: 'Training rewards, bigger dogs, picky pups, and simple-ingredient routines.',
    notIncluded: ['No salt', 'No sugar', 'No glycerin', 'No preservatives', 'No fillers'],
    freshness: 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
    storageFeeding: 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    variants: [
      {
        size: '6 oz',
        price: 14.99,
        sku: 'CNE-DT-CHICKEN-6OZ',
        quantity: 24,
        stockStatus: 'in-stock',
        lowStockThreshold: 5,
      },
      {
        size: '18 oz',
        price: 39.99,
        sku: 'CNE-DT-CHICKEN-18OZ',
        quantity: 10,
        stockStatus: 'in-stock',
        lowStockThreshold: 3,
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
    sellingMode: 'inventory-limited',
    featured: false,
    tags: ['High Protein', 'Rich Flavor'],
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Beef. No salt, no sugar, no glycerin, no preservatives.',
    texture: 'Firm, rich jerky texture with a stronger chew.',
    bestFor: 'Bigger dogs, rich-flavor lovers, high-value rewards, and dogs who enjoy beef treats.',
    notIncluded: ['No salt', 'No sugar', 'No glycerin', 'No preservatives', 'No fillers'],
    freshness: 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
    storageFeeding: 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    variants: [
      {
        size: '6 oz',
        price: 17.99,
        sku: 'CNE-DT-BEEF-6OZ',
        quantity: 18,
        stockStatus: 'in-stock',
        lowStockThreshold: 5,
      },
      {
        size: '18 oz',
        price: 47.99,
        sku: 'CNE-DT-BEEF-18OZ',
        quantity: 0,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 3,
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
    sellingMode: 'inventory-limited',
    featured: false,
    tags: ['Lean Protein', 'Easy to Digest'],
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Turkey breast. No salt, no sugar, no glycerin, no preservatives.',
    texture: 'Lean jerky texture that breaks down into smaller training pieces.',
    bestFor: 'Dogs who prefer lighter proteins, training rewards, and simple-ingredient treat routines.',
    notIncluded: ['No salt', 'No sugar', 'No glycerin', 'No preservatives', 'No fillers'],
    freshness: 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
    storageFeeding: 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    variants: [
      {
        size: '6 oz',
        price: 16.99,
        sku: 'CNE-DT-TURKEY-6OZ',
        quantity: 0,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 5,
      },
      {
        size: '18 oz',
        price: 44.99,
        sku: 'CNE-DT-TURKEY-18OZ',
        quantity: 0,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 3,
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
    sellingMode: 'inventory-limited',
    featured: false,
    tags: ['Premium Cut', 'Rich Protein'],
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Lamb. No salt, no sugar, no glycerin, no preservatives.',
    texture: 'Premium firm jerky texture with a richer chew.',
    bestFor: 'Premium treat routines, richer protein variety, bigger dogs, and high-value rewards.',
    notIncluded: ['No salt', 'No sugar', 'No glycerin', 'No preservatives', 'No fillers'],
    freshness: 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
    storageFeeding: 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    variants: [
      {
        size: '6 oz',
        price: 22.99,
        sku: 'CNE-DT-LAMB-6OZ',
        quantity: 0,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 5,
      },
      {
        size: '18 oz',
        price: 59.99,
        sku: 'CNE-DT-LAMB-18OZ',
        quantity: 0,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 3,
      },
    ],
    guaranteedAnalysis: {
      crudeProteinMin: '65%',
      crudeFatMin: '8%',
      crudeFiberMax: '1%',
      moistureMax: '20%',
    },
  },
  {
    id: 'training-bites',
    name: 'Training Bites',
    protein: 'Chicken',
    cut: 'Small Bite',
    shortDescription: 'Tiny, high-reward morsels for focused sessions.',
    category: 'Training',
    status: 'coming-soon',
    sellingMode: 'preorder',
    featured: false,
    tags: ['Training Size', 'Coming Soon'],
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Chicken. No salt, no sugar, no glycerin, no preservatives.',
    texture: 'Small bite-sized pieces designed for quick rewards.',
    bestFor: 'Training sessions, puppy practice, small rewards, and repeated commands.',
    notIncluded: ['No salt', 'No sugar', 'No glycerin', 'No preservatives', 'No fillers'],
    freshness: 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.',
    storageFeeding: 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    variants: [
      {
        size: '6 oz',
        price: 13.99,
        sku: 'CNE-DT-TRAINING-6OZ',
        quantity: 0,
        stockStatus: 'coming-soon',
        lowStockThreshold: 5,
      },
      {
        size: '18 oz',
        price: 36.99,
        sku: 'CNE-DT-TRAINING-18OZ',
        quantity: 0,
        stockStatus: 'coming-soon',
        lowStockThreshold: 3,
      },
    ],
    guaranteedAnalysis: {},
  },
  {
    id: 'seasonal-drop',
    name: 'Seasonal Drop',
    protein: 'Rotating',
    cut: 'Limited Batch',
    shortDescription: 'Limited runs inspired by the season. New flavors, same clean promise.',
    category: 'Seasonal',
    status: 'coming-soon',
    sellingMode: 'preorder',
    featured: false,
    tags: ['Limited Time', 'Special Flavor'],
    image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=1200&auto=format&fit=crop',
    ingredients: 'Rotating seasonal protein. Final ingredients listed on each batch.',
    texture: 'Limited-batch texture varies by seasonal recipe.',
    bestFor: 'Seasonal variety, limited drops, giftable treat moments, and dogs who enjoy new flavors.',
    notIncluded: ['No unnecessary fillers', 'No artificial preservatives', 'No artificial colors'],
    freshness: 'Freshness guidance will be listed on each seasonal batch.',
    storageFeeding: 'Follow the storage guidance listed on each seasonal batch. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.',
    variants: [
      {
        size: '6 oz',
        price: 18.99,
        sku: 'CNE-DT-SEASONAL-6OZ',
        quantity: 0,
        stockStatus: 'coming-soon',
        lowStockThreshold: 5,
      },
      {
        size: '18 oz',
        price: 49.99,
        sku: 'CNE-DT-SEASONAL-18OZ',
        quantity: 0,
        stockStatus: 'coming-soon',
        lowStockThreshold: 3,
      },
    ],
    guaranteedAnalysis: {},
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
    ...normalizeProductInput({
      ...existingProduct,
      ...productInput,
    }),
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
