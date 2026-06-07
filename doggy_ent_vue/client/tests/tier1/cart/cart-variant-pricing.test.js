import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import {
  useCart,
} from '../../../src/domains/cart/composables/useCart.js'

function installStorageMock() {
  const store = new Map()

  globalThis.localStorage = {
    getItem: vi.fn((key) => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
  }
}

describe('cart selected variant pricing', () => {
  it('uses the selected 6 oz variant price instead of defaulting to 18 oz', () => {
    installStorageMock()

    const product = {
      id: 'jerky',
      name: 'Chicken Breast Jerky',
      variants: [
        {
          size: '18 oz',
          price: 45,
        },
        {
          size: '6 oz',
          price: 18,
        },
      ],
    }

    const cart = useCart({
      products: ref([product]),
      getSellingMode: () => 'MADE_TO_ORDER',
      isPurchasable: () => true,
      getAvailableQuantity: () => 10,
      limitQuantity: (_product, quantity) => quantity,
    })

    cart.addToCart(product, '6 oz')

    expect(cart.cart.value).toHaveLength(1)
    expect(cart.cart.value[0].size).toBe('6 oz')
    expect(cart.cart.value[0].price).toBe(18)
    expect(cart.subtotal.value).toBe(18)
  })

  it('uses the selected 18 oz variant when chosen', () => {
    installStorageMock()

    const product = {
      id: 'jerky',
      name: 'Chicken Breast Jerky',
      variants: [
        {
          size: '6 oz',
          price: 18,
        },
        {
          size: '18 oz',
          price: 45,
        },
      ],
    }

    const cart = useCart({
      products: ref([product]),
      getSellingMode: () => 'MADE_TO_ORDER',
      isPurchasable: () => true,
      getAvailableQuantity: () => 10,
      limitQuantity: (_product, quantity) => quantity,
    })

    cart.addToCart(product, '18 oz')

    expect(cart.cart.value[0].size).toBe('18 oz')
    expect(cart.cart.value[0].price).toBe(45)
    expect(cart.subtotal.value).toBe(45)
  })
})
