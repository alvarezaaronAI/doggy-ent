<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PawPrint, ArrowLeft } from '@lucide/vue'
import OrderConfirmationContent from '../OrderSuccess/OrderConfirmationContent.vue'
import { useOrderConfirmation } from '../composables/useOrderConfirmation.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { commercePresentation } from '@storefront-content/commercePresentation.js'
import PageRecovery from '@shared/components/PageRecovery.vue'
import { useRecoveryMetadata } from '@shared/composables/useRecoveryMetadata.js'
const route = useRoute()
const { order, loading, error, load } = useOrderConfirmation(computed(() => String(route.params.orderId || '')))
const { content, loadContent } = useStorefrontContent()
const settings = computed(() => commercePresentation(content.value).confirmation)
useRecoveryMetadata(computed(() => !loading.value && (error.value || !order.value) ? 'Order details unavailable' : null))
onMounted(loadContent)
</script>
<template>
  <div class="storefront-ui store-pattern flex-1 text-stone-800">
    <header class="border-b border-stone-200 bg-white"><nav class="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-5"><RouterLink to="/" class="inline-flex items-center gap-2 font-semibold text-[#6a3c2b]"><PawPrint :size="24" class="text-[#315bc5]" />Chase &amp; Evie Co.</RouterLink><RouterLink to="/" class="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm"><ArrowLeft :size="16" />Back to shop</RouterLink></nav></header>
    <main>
      <p v-if="loading" class="mx-auto max-w-3xl px-4 py-16" role="status">Loading your order confirmation...</p>
      <PageRecovery v-else-if="error || !order" kind="order-unavailable" :retrying="loading" @retry="load" />
      <OrderConfirmationContent v-else :order="order" :settings="settings" :signed-in="order.accountLinked" />
    </main>
  </div>
</template>
