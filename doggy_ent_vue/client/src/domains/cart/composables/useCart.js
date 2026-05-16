import { computed, ref, watch } from 'vue'

export function useCart({
  products,
  getSellingMode,
  isPurchasable,
  getAvailableQuantity,
  limitQuantity,
}) {
  const cart = ref([])
  const isCartOpen = ref(false)

  const CART_STORAGE_KEY = 'doggy-ent-cart'

  function normalizeCartItem(item) {
    return {
      ...item,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      availableQuantity: Number(item.availableQuantity || 0),
    }
  }

  function loadSavedCart() {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
      cart.value = Array.isArray(savedCart)
        ? savedCart.map(normalizeCartItem)
        : []
    } catch {
      cart.value = []
    }
  }

  watch(
    cart,
    (updatedCart) => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart))
    },
    { deep: true }
  )

  function addToCart(product, selectedSize) {
    const defaultSize = product.category === 'Bundle' ? 'Bundle' : '6 oz'
    const size = product.size || selectedSize || defaultSize
    const quantityToAdd = product.quantity || 1

    const selectedVariant = product.variants?.find(
      (variant) => variant.size === size
    )
    if (!selectedVariant && product.variants?.length) return

    const availableQuantity = getAvailableQuantity(product, selectedVariant)

    if (!isPurchasable(product, selectedVariant)) return

    const price = Number(
      product.price ||
      selectedVariant?.price ||
      product.variants?.[0]?.price ||
      0
    )

    const existing = cart.value.find(
      (item) => item.id === product.id && item.size === size
    )

    if (existing) {
      const nextQuantity = existing.quantity + quantityToAdd

      existing.quantity = limitQuantity(
        product,
        nextQuantity,
        availableQuantity
      )
    } else {
      cart.value.push({
        ...product,
        price,
        size,
        variant: selectedVariant || null,
        quantity: limitQuantity(
          product,
          quantityToAdd,
          availableQuantity
        ),
        availableQuantity,
        sellingMode: getSellingMode(product),
      })
    }

    isCartOpen.value = true
  }

  function increase(id, size) {
    const item = cart.value.find(
      (cartItem) => cartItem.id === id && cartItem.size === size
    )

    if (!item) return

    const currentProduct = products.value.find(
      (product) => product.id === id
    )

    const currentVariant = currentProduct?.variants?.find(
      (variant) => variant.size === size
    )

    const availableQuantity = getAvailableQuantity(
      currentProduct || item,
      currentVariant
    )

    const nextQuantity = item.quantity + 1

    item.quantity = limitQuantity(
      currentProduct || item,
      nextQuantity,
      availableQuantity
    )
  }

  function decrease(id, size) {
    const item = cart.value.find(
      (cartItem) => cartItem.id === id && cartItem.size === size
    )

    if (!item) return

    item.quantity -= 1

    if (item.quantity <= 0) {
      remove(id, size)
    }
  }

  function remove(id, size) {
    cart.value = cart.value.filter(
      (cartItem) => !(cartItem.id === id && cartItem.size === size)
    )
  }

  const subtotal = computed(() =>
    cart.value.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )
  )

  const itemCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  return {
    cart,
    isCartOpen,
    subtotal,
    itemCount,
    loadSavedCart,
    addToCart,
    increase,
    decrease,
    remove,
  }
}
