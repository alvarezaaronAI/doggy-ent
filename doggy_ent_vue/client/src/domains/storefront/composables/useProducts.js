import { computed, ref } from 'vue'
import { fetchProducts } from '../services/products.api'

export function useProducts() {
  const products = ref([])
  const isLoading = ref(true)
  const errorMessage = ref('')

  async function loadProducts() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      products.value = await fetchProducts()
    } catch (error) {
      products.value = []
      errorMessage.value = error.message || 'Unable to load products.'
    } finally {
      isLoading.value = false
    }
  }

  const availableCategories = computed(() => {
    const categories = products.value
      .map((product) => product.category)
      .filter(Boolean)

    return ['all', ...new Set(categories)]
  })

  const availableProteins = computed(() => {
    const proteins = products.value
      .map((product) => product.protein)
      .filter(Boolean)

    return ['all', ...new Set(proteins)]
  })

  const comingSoonProducts = computed(() =>
    products.value.filter((product) => product.status === 'coming-soon')
  )

  const storefrontProducts = computed(() =>
    products.value.filter((product) => product.status !== 'coming-soon')
  )

  return {
    products,
    isLoading,
    errorMessage,
    availableCategories,
    availableProteins,
    comingSoonProducts,
    storefrontProducts,
    loadProducts,
  }
}