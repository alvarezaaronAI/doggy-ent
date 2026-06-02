import {
  PRODUCT_DEFAULTS,
  PRODUCT_LOW_STOCK_THRESHOLDS,
  PRODUCT_STOCK_STATUS,
  PRODUCT_VARIANT_SIZES,
} from '../constants/products.constants.js'
import {
  buildVariantSku,
  normalizeInventoryQuantity,
  slugifyProduct,
  toPrismaEnum,
} from '../utils/products.utils.js'

function normalizeStringList(value) {
  return Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}

function getStockStatus(quantity, incomingStatus) {
  if (incomingStatus === PRODUCT_STOCK_STATUS.COMING_SOON) {
    return PRODUCT_STOCK_STATUS.COMING_SOON
  }

  if (quantity <= 0) {
    return PRODUCT_STOCK_STATUS.OUT_OF_STOCK
  }

  return PRODUCT_STOCK_STATUS.IN_STOCK
}

function getVariantBySize(variants, size) {
  return variants.find((variant) => variant.size === size) || {}
}

function normalizeVariant({
  productInput,
  variant,
  size,
  stockStatus,
}) {
  const quantity = normalizeInventoryQuantity(
    variant.quantity,
  )

  return {
    size,
    price: Number(variant.price ?? 0),
    sku: variant.sku,
    quantity,
    stockStatus: getStockStatus(quantity, stockStatus),
    lowStockThreshold: normalizeInventoryQuantity(
      variant.lowStockThreshold
      ?? PRODUCT_LOW_STOCK_THRESHOLDS[size],
    ),
  }
}

export function normalizeProductInput(productInput) {
  const variants = Array.isArray(productInput.variants)
    ? productInput.variants.map((variant) => ({
        ...variant,
        quantity: normalizeInventoryQuantity(
          variant.quantity,
        ),
        lowStockThreshold: normalizeInventoryQuantity(
          variant.lowStockThreshold,
        ),
        sku:
          variant.sku ||
          buildVariantSku(
            productInput,
            variant.size || 'variant',
          ),
      }))
    : []

  const sixOzVariant = getVariantBySize(
    variants,
    PRODUCT_VARIANT_SIZES.SIX_OZ,
  )

  const eighteenOzVariant = getVariantBySize(
    variants,
    PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ,
  )

  return {
    name: productInput.name,
    protein: productInput.protein || '',
    cut: productInput.cut || '',
    shortDescription: productInput.shortDescription,
    category: productInput.category,
    status: productInput.status,
    sellingMode:
      productInput.sellingMode ||
      PRODUCT_DEFAULTS.SELLING_MODE,
    featured: Boolean(productInput.featured),
    tags: normalizeStringList(productInput.tags),
    image: productInput.image,
    ingredients:
      productInput.ingredients ||
      `${productInput.protein || 'Protein'}. No salt, no sugar, no glycerin, no preservatives.`,
    texture:
      productInput.texture ||
      PRODUCT_DEFAULTS.TEXTURE,
    bestFor:
      productInput.bestFor ||
      PRODUCT_DEFAULTS.BEST_FOR,
    notIncluded: normalizeStringList(
      productInput.notIncluded,
    ),
    freshness:
      productInput.freshness ||
      PRODUCT_DEFAULTS.FRESHNESS,
    storageFeeding:
      productInput.storageFeeding ||
      PRODUCT_DEFAULTS.STORAGE_FEEDING,
    showGuaranteedAnalysis: Boolean(
      productInput.showGuaranteedAnalysis,
    ),
    variants: [
      normalizeVariant({
        productInput,
        variant: sixOzVariant,
        size: PRODUCT_VARIANT_SIZES.SIX_OZ,
        stockStatus:
          productInput.sixOzStockStatus ||
          productInput.variants?.[0]?.stockStatus,
      }),
      normalizeVariant({
        productInput,
        variant: eighteenOzVariant,
        size: PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ,
        stockStatus:
          productInput.eighteenOzStockStatus ||
          productInput.variants?.[1]?.stockStatus,
      }),
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

export function mapProductWithDisplayPrice(product) {
  return {
    ...product,
    price: product.variants?.[0]?.price
      ? product.variants[0].price / 100
      : 0,
  }
}

export function buildProductMutationData(normalizedProduct) {
  return {
    name: normalizedProduct.name,
    slug: slugifyProduct(normalizedProduct.name),
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
    sellingMode: toPrismaEnum(
      normalizedProduct.sellingMode,
    ),
    tags: normalizedProduct.tags,
    status: toPrismaEnum(normalizedProduct.status),
    variants: {
      create: normalizedProduct.variants.map((variant) => ({
        size: variant.size,
        price: Math.round(Number(variant.price) * 100),
        inventory: variant.quantity,
        sku: variant.sku,
      })),
    },
  }
}
