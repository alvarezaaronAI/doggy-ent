import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { normalizeProduct } from '../../../src/domains/products/mappers/product.mapper.js'
import { useProductVariants } from '../../../src/domains/products/composables/useProductVariants.js'
import { useProductFilters } from '../../../src/domains/products/composables/useProductFilters.js'

describe('storefront variant source of truth', () => {
  const product = normalizeProduct({
    id: 'chicken',
    name: 'Chicken',
    status: 'ACTIVE',
    sellingMode: 'MADE_TO_ORDER',
    variants: [
      { size: '18 oz', price: 3999 },
      { size: '6 oz', price: 1799 },
      { size: '3 oz', price: 999, isActive: false },
    ],
  })
  it('normalizes cents once and orders active options independently of database order', () => {
    expect(product.variants.map((variant) => variant.size)).toEqual([
      '6 oz',
      '18 oz',
    ])
    expect(product.price).toBe(17.99)
    expect(product.variants[1].price).toBe(39.99)
  })
  it('keeps per-product selections independent and falls back when a variant is removed', () => {
    const state = useProductVariants()
    const beef = { ...product, id: 'beef' }
    state.selectCardSize(product, '18 oz')
    expect(state.getSelectedCardSize(product)).toBe('18 oz')
    expect(state.getSelectedCardSize(beef)).toBe('6 oz')
    state.selectCardSize(beef, 'not-a-variant')
    expect(state.getSelectedCardSize(beef)).toBe('6 oz')
    expect(
      state.getSelectedCardSize({
        ...product,
        variants: [product.variants[0]],
      }),
    ).toBe('6 oz')
    expect(state.getSelectedCardSize(null)).toBe('')
  })
  it('preserves zero prices and does not reorder a price-sorted collection after selection', () => {
    const free = {
      ...product,
      id: 'free',
      variants: [
        { size: '6 oz', price: 0 },
        { size: '18 oz', price: 100 },
      ],
    }
    const variants = useProductVariants()
    const filters = useProductFilters(ref([product, free]))
    filters.searchQuery.value = ''
    filters.selectedSort.value = 'price-low'
    expect(filters.activeProducts.value.map((p) => p.id)).toEqual([
      'free',
      'chicken',
    ])
    variants.selectCardSize(free, '18 oz')
    expect(filters.activeProducts.value.map((p) => p.id)).toEqual([
      'free',
      'chicken',
    ])
    variants.selectCardSize(free, '6 oz')
    expect(variants.getSelectedCardPrice(free)).toBe(0)
  })
})
