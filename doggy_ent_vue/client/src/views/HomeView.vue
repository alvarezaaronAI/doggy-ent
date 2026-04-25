<script setup>
import { ref, computed, onMounted } from 'vue'
import CartDrawer from '../components/cart/CartDrawer.vue'

// state
const products = ref([])
const cart = ref([])
const isCartOpen = ref(false)

// fetch products
async function loadProducts() {
  const res = await fetch('/api/products')
  const data = await res.json()
  products.value = data
}

onMounted(loadProducts)

// cart logic
function addToCart(product) {
  const existing = cart.value.find(p => p.id === product.id)

  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({
      ...product,
      quantity: 1,
      size: 'Default'
    })
  }

  isCartOpen.value = true
}

function increase(id) {
  const item = cart.value.find(p => p.id === id)
  if (item) item.quantity++
}

function decrease(id) {
  const item = cart.value.find(p => p.id === id)
  if (item && item.quantity > 1) item.quantity--
}

function remove(id) {
  cart.value = cart.value.filter(p => p.id !== id)
}

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const itemCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
)
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-extrabold mb-6">Storefront</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="border p-4 rounded-lg"
      >
        <h2 class="font-bold">{{ product.name }}</h2>
        <p class="text-sm text-gray-500">{{ product.description }}</p>
        <p class="mt-2 font-semibold">${{ product.price }}</p>

        <button
          class="mt-3 bg-yellow-300 px-4 py-2 rounded"
          @click="addToCart(product)"
        >
          Add to Cart
        </button>
      </div>
    </div>

    <CartDrawer
      :isOpen="isCartOpen"
      :cartItems="cart"
      :subtotal="subtotal"
      :itemCount="itemCount"
      @close="isCartOpen = false"
      @increase="increase"
      @decrease="decrease"
      @remove="remove"
      @continue-shopping="isCartOpen = false"
    />
  </main>
</template>
