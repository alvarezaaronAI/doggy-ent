

import { ref } from 'vue'
import {
  getSellingMode,
  isPurchasable,
  getAvailableQuantity,
  limitQuantity,
  getStockLabel,
} from '../../../shared/constants/sellingMode'

export function useProductVariants() {
  const selectedCardSizes = ref({})

  function getVariantPrice(product, size) {
    return (
      product.variants?.find((variant) => variant.size === size)?.price ||
      product.price ||
      0
    )
  }

  function hasVariant(product, size) {
    return Boolean(
      product.variants?.find((variant) => variant.size === size)
    )
  }

  function getProductVariants(product) {
    return Array.isArray(product.variants) ? product.variants : []
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
    return (
      selectedCardSizes.value[product.id] ||
      getProductVariants(product)[0]?.size ||
      '6 oz'
    )
  }

  function selectCardSize(product, size) {
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
      (variant) => variant.size === getSelectedCardSize(product)
    )
  }

  function getVariantBySize(product, size) {
    return (
      getProductVariants(product).find(
        (variant) => variant.size === size
      ) || getDefaultVariant(product)
    )
  }

  function getSelectedStockLabel(product, variant = null) {
    return getStockLabel(
      product,
      variant || getSelectedCardVariant(product)
    )
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