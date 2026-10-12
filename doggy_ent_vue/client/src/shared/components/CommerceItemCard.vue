<script setup>
import { computed, ref, watch } from 'vue'
import { Package, Tag } from '@lucide/vue'
import CommerceCardSurface from './CommerceCardSurface.vue'
import ProductCampaignBadge from '@products/ProductCard/ProductCampaignBadge.vue'
import { mapCommerceItem } from '../mappers/commerceItem.mapper.js'
import { mediaImageSource } from '../utils/mediaImage.js'
import { formatCurrency } from '../utils/currency.js'
const props = defineProps({ item: { type: Object, required: true }, campaigns: { type: Array, default: () => [] }, promoCode: { type: String, default: '' }, formatPrice: { type: Function, default: formatCurrency } })
const row = computed(() => mapCommerceItem(props.item)), failed = ref(false)
watch(() => row.value.image, () => { failed.value = false })
</script>
<template>
  <CommerceCardSurface :giving="campaigns.length > 0" :promotion="Boolean(promoCode)" class="p-4">
    <div class="flex min-w-0 gap-3">
      <div class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-stone-200 bg-white">
        <img v-if="row.image && !failed" :src="mediaImageSource(row.image)" :alt="row.name" class="h-full w-full object-cover" loading="lazy" @error="failed = true" />
        <Package v-else :size="24" aria-hidden="true" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0"><h3 class="break-words text-sm font-semibold">{{ row.name }}</h3><p class="mt-1 text-sm text-stone-600">{{ row.size }} · Qty {{ row.quantity }}</p></div>
          <strong class="text-sm">{{ formatPrice(row.lineTotal) }}</strong>
        </div>
        <p class="mt-1 text-xs text-stone-600">{{ formatPrice(row.unitPrice) }} each</p>
        <p v-if="row.sku" class="mt-1 break-all text-[10px] text-stone-500">SKU {{ row.sku }}</p>
        <slot name="details" />
        <ProductCampaignBadge :campaigns="campaigns" />
        <p v-if="promoCode" class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#775a1c]"><Tag :size="13" />Promo applied · {{ promoCode }}</p>
        <slot name="actions" />
      </div>
    </div>
  </CommerceCardSurface>
</template>
