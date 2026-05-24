

import { computed, ref } from 'vue'

export function useProductFilters(products, getSelectedCardPrice) {
  const searchQuery = ref('')
  const selectedCategory = ref('all')
  const selectedProtein = ref('all')
  const selectedSort = ref('featured')

  const activeProducts = computed(() => {
    const normalizedSearch = searchQuery.value.trim().toLowerCase()

    let filteredProducts = products.value.filter((product) => {
      if (product.status !== 'active') {
        return false
      }

      const matchesSearch = !normalizedSearch || [
        product.name,
        product.category,
        product.protein,
        ...(Array.isArray(product.tags) ? product.tags : []),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch)
        )

      const matchesCategory =
        selectedCategory.value === 'all' ||
        product.category === selectedCategory.value

      const matchesProtein =
        selectedProtein.value === 'all' ||
        product.protein === selectedProtein.value

      return matchesSearch && matchesCategory && matchesProtein
    })

    if (selectedSort.value === 'price-low') {
      filteredProducts = [...filteredProducts].sort(
        (a, b) => getSelectedCardPrice(a) - getSelectedCardPrice(b)
      )
    }

    if (selectedSort.value === 'price-high') {
      filteredProducts = [...filteredProducts].sort(
        (a, b) => getSelectedCardPrice(b) - getSelectedCardPrice(a)
      )
    }

    if (selectedSort.value === 'alphabetical') {
      filteredProducts = [...filteredProducts].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    }

    return filteredProducts
  })

  return {
    searchQuery,
    selectedCategory,
    selectedProtein,
    selectedSort,
    activeProducts,
  }
}