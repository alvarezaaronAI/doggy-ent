import { ref } from 'vue'
import {
  getOrderedProductVariants,
  getProductVariantPrice,
} from '../utils/productVariants.js'
import {
  getSellingMode,
  isPurchasable,
  getAvailableQuantity,
  limitQuantity,
  getStockLabel,
} from '@shared/constants/sellingMode'

export function useProductVariants() {
  const selectedCardSizes = ref({})

  function getVariantPrice(product, size) {
    return getProductVariantPrice(product, size)
  }

  function hasVariant(product, size) {
    return Boolean(
      getProductVariants(product).find((variant) => variant.size === size),
    )
  }

  function getProductVariants(product) {
    return getOrderedProductVariants(product)
  }

  function getDefaultVariant(product) {
    const variants = getProductVariants(product)

    if (!variants.length) {
      return {
        size: '6 oz',
        price: Number(product?.price || 0),
        sku: '',
        quantity: 0,
        stockStatus: 'out-of-stock',
        lowStockThreshold: 0,
      }
    }

    return variants[0]
  }

  function getSelectedCardSize(product) {
    const variants = getProductVariants(product)
    const selected = selectedCardSizes.value[product?.id]
    return variants.some((variant) => variant.size === selected)
      ? selected
      : variants[0]?.size || ''
  }

  function selectCardSize(product, size) {
    if (!product?.id || !hasVariant(product, size)) return
    selectedCardSizes.value = {
      ...selectedCardSizes.value,
      [product.id]: size,
    }
  }

  function getSelectedCardPrice(product) {
    return getVariantPrice(product, getSelectedCardSize(product))
  }

  function getSelectedCardVariant(product) {
    return getProductVariants(product).find(
      (variant) => variant.size === getSelectedCardSize(product),
    )
  }

  function getVariantBySize(product, size) {
    return (
      getProductVariants(product).find((variant) => variant.size === size) ||
      getDefaultVariant(product)
    )
  }

  function getSelectedStockLabel(product, variant = null) {
    return getStockLabel(product, variant || getSelectedCardVariant(product))
  }

  return {
    selectedCardSizes,
    getVariantPrice,
    hasVariant,
    getProductVariants,
    getDefaultVariant,
    getSelectedCardSize,
    selectCardSize,
    getSelectedCardPrice,
    getSelectedCardVariant,
    getVariantBySize,
    getSelectedStockLabel,
    getSellingMode,
    isPurchasable,
    getAvailableQuantity,
    limitQuantity,
  }
}
