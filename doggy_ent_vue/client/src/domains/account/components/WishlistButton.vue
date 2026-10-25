<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, LoaderCircle } from '@lucide/vue'
import { useAccountAuth } from '../composables/useAccountAuth.js'
import { useAccountWishlist } from '../composables/useAccountWishlist.js'
import { safeAccountReturn } from '../utils/accountNavigation.js'
const props = defineProps({ product: { type: Object, required: true } })
const { authenticated } = useAccountAuth()
const { has, isPending, loading, toggle, error } = useAccountWishlist()
const route = useRoute(), router = useRouter(), showError = ref(false)
const saved = computed(() => has(props.product.id))
const busy = computed(() => isPending(props.product.id) || loading.value)
const label = computed(() => !authenticated.value ? 'Sign in to save this treat' : saved.value ? `Remove ${props.product.name} from wishlist` : `Save ${props.product.name} to wishlist`)
async function change() {
  showError.value = false
  if (!authenticated.value) {
    return router.push({ path: '/account/sign-in', query: { redirect: safeAccountReturn(route.fullPath) || '/account/wishlist' } })
  }
  showError.value = !await toggle(props.product.id)
}
</script>
<template>
  <div class="relative">
    <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#cad5ce] bg-white text-[#17664e] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17664e] disabled:cursor-wait disabled:opacity-60" :aria-label="label" :title="label" :aria-pressed="saved" :disabled="busy" @click.stop="change">
      <LoaderCircle v-if="busy" :size="19" aria-hidden="true" />
      <Heart v-else :size="19" :fill="saved ? 'currentColor' : 'none'" aria-hidden="true" />
    </button>
    <p v-if="showError && error" role="alert" class="absolute right-0 top-12 z-20 w-48 rounded border border-red-200 bg-white p-3 text-xs text-red-800 shadow-sm">{{ error }}</p>
  </div>
</template>
