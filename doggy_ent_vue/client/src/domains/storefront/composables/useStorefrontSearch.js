import { ref } from 'vue'

const searchQuery = ref('')

export function useStorefrontSearch() {
  return {
    searchQuery,
  }
}
