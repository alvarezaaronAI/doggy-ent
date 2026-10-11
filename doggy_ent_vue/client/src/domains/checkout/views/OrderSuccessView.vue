<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PawPrint, ArrowLeft } from '@lucide/vue'
import OrderConfirmationContent from '../OrderSuccess/OrderConfirmationContent.vue'
import { useOrderConfirmation } from '../composables/useOrderConfirmation.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { commercePresentation } from '@storefront-content/commercePresentation.js'
const route = useRoute()
const { order, loading, error, load } = useOrderConfirmation(computed(() => String(route.params.orderId || '')))
const { content, loadContent } = useStorefrontContent()
const settings = computed(() => commercePresentation(content.value).confirmation)
onMounted(loadContent)
</script>
<template>
  <div class="min-h-screen bg-[#f8f5ef] text-stone-800">
    <header class="border-b border-stone-200 bg-white"><nav class="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-5"><RouterLink to="/" class="inline-flex items-center gap-2 font-semibold text-[#6a3c2b]"><PawPrint :size="24" class="text-[#315bc5]" />Chase &amp; Evie Co.</RouterLink><RouterLink to="/" class="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm"><ArrowLeft :size="16" />Back to shop</RouterLink></nav></header>
    <main>
      <p v-if="loading" class="mx-auto max-w-3xl px-4 py-16" role="status">Loading your order confirmation...</p>
      <section v-else-if="error || !order" class="mx-auto max-w-3xl px-4 py-16"><h1 class="text-2xl font-semibold">Let's find your order</h1><p class="mt-4 text-sm" role="alert">{{ error || 'Order unavailable.' }}</p><p class="mt-3 text-sm">Do not pay again if your payment was completed. Sign in for your own order history or contact our team with your reference.</p><div class="mt-5 flex flex-wrap gap-3"><button type="button" class="rounded-md border border-stone-300 bg-white px-4 py-3" @click="load">Try again</button><RouterLink to="/account/orders" class="rounded-md border border-stone-300 bg-white px-4 py-3">Your orders</RouterLink></div></section>
      <OrderConfirmationContent v-else :order="order" :settings="settings" :signed-in="order.accountLinked" />
    </main>
  </div>
</template>
