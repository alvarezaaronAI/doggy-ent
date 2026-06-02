import {
  DEFAULT_PRODUCT_SELLING_MODE,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCT_VARIANT_DEFAULTS,
  PRODUCT_VARIANT_SIZES,
} from '../constants/adminProducts.constants'

function commaListToArray(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function arrayToCommaList(value) {
  return Array.isArray(value) ? value.join(', ') : ''
}

export function getProductVariant(product, size) {
  return product?.variants?.find((variant) => variant.size === size)
}

export function createEmptyAdminProductForm() {
  return {
    name: '',
    protein: '',
    cut: '',
    shortDescription: '',
    category: PRODUCT_CATEGORIES[0],
    status: PRODUCT_STATUSES.DRAFT,
    sellingMode: DEFAULT_PRODUCT_SELLING_MODE,
    featured: false,
    tags: '',
    image: '',
    ingredients: '',
    texture: '',
    bestFor: '',
    notIncluded: '',
    freshness: '',
    storageFeeding: '',
    showGuaranteedAnalysis: false,
    sixOzPrice: '',
    eighteenOzPrice: '',
    sixOzQuantity: '',
    eighteenOzQuantity: '',
    sixOzLowStockThreshold:
      PRODUCT_VARIANT_DEFAULTS.SIX_OZ_LOW_STOCK_THRESHOLD,
    eighteenOzLowStockThreshold:
      PRODUCT_VARIANT_DEFAULTS.EIGHTEEN_OZ_LOW_STOCK_THRESHOLD,
    sixOzSku: '',
    eighteenOzSku: '',
    crudeProteinMin: '',
    crudeFatMin: '',
    crudeFiberMax: '',
    moistureMax: '',
  }
}

export function mapProductToAdminProductForm(product) {
  const sixOzVariant = getProductVariant(
    product,
    PRODUCT_VARIANT_SIZES.SIX_OZ,
  )
  const eighteenOzVariant = getProductVariant(
    product,
    PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ,
  )

  return {
    ...createEmptyAdminProductForm(),
    name: product.name || '',
    protein: product.protein || '',
    cut: product.cut || '',
    shortDescription: product.shortDescription || '',
    category: product.category || PRODUCT_CATEGORIES[0],
    status: product.status || PRODUCT_STATUSES.DRAFT,
    sellingMode: product.sellingMode || DEFAULT_PRODUCT_SELLING_MODE,
    featured: Boolean(product.featured),
    tags: arrayToCommaList(product.tags),
    image: product.image || '',
    ingredients: product.ingredients || '',
    texture: product.texture || '',
    bestFor: product.bestFor || '',
    notIncluded: arrayToCommaList(product.notIncluded),
    freshness: product.freshness || '',
    storageFeeding: product.storageFeeding || '',
    showGuaranteedAnalysis: Boolean(product.showGuaranteedAnalysis),
    sixOzPrice: sixOzVariant?.price ?? product.price ?? '',
    eighteenOzPrice: eighteenOzVariant?.price ?? '',
    sixOzQuantity: sixOzVariant?.quantity ?? '',
    eighteenOzQuantity: eighteenOzVariant?.quantity ?? '',
    sixOzLowStockThreshold:
      sixOzVariant?.lowStockThreshold
      ?? PRODUCT_VARIANT_DEFAULTS.SIX_OZ_LOW_STOCK_THRESHOLD,
    eighteenOzLowStockThreshold:
      eighteenOzVariant?.lowStockThreshold
      ?? PRODUCT_VARIANT_DEFAULTS.EIGHTEEN_OZ_LOW_STOCK_THRESHOLD,
    sixOzSku: sixOzVariant?.sku || '',
    eighteenOzSku: eighteenOzVariant?.sku || '',
    crudeProteinMin: product.guaranteedAnalysis?.crudeProteinMin || '',
    crudeFatMin: product.guaranteedAnalysis?.crudeFatMin || '',
    crudeFiberMax: product.guaranteedAnalysis?.crudeFiberMax || '',
    moistureMax: product.guaranteedAnalysis?.moistureMax || '',
  }
}

export function buildAdminProductPayload(form) {
  return {
    name: form.name,
    protein: form.protein,
    cut: form.cut,
    shortDescription: form.shortDescription,
    category: form.category,
    status: form.status,
    sellingMode: form.sellingMode,
    featured: form.featured,
    tags: commaListToArray(form.tags),
    image: form.image,
    ingredients: form.ingredients,
    texture: form.texture,
    bestFor: form.bestFor,
    notIncluded: commaListToArray(form.notIncluded),
    freshness: form.freshness,
    storageFeeding: form.storageFeeding,
    variants: [
      {
        size: PRODUCT_VARIANT_SIZES.SIX_OZ,
        price: Number(form.sixOzPrice),
        quantity: Number(form.sixOzQuantity),
        lowStockThreshold: Number(form.sixOzLowStockThreshold),
        sku: form.sixOzSku,
      },
      {
        size: PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ,
        price: Number(form.eighteenOzPrice),
        quantity: Number(form.eighteenOzQuantity),
        lowStockThreshold: Number(form.eighteenOzLowStockThreshold),
        sku: form.eighteenOzSku,
      },
    ],
    showGuaranteedAnalysis: Boolean(form.showGuaranteedAnalysis),
    guaranteedAnalysis: form.showGuaranteedAnalysis
      ? {
          crudeProteinMin: form.crudeProteinMin,
          crudeFatMin: form.crudeFatMin,
          crudeFiberMax: form.crudeFiberMax,
          moistureMax: form.moistureMax,
        }
      : {},
  }
}
