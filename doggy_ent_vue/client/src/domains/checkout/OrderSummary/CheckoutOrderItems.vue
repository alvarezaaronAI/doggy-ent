<script setup>
import CommerceItemCard from '@shared/components/CommerceItemCard.vue'
import { itemCampaigns } from '@shared/mappers/commerceItem.mapper.js'
defineProps({ cartItems: { type: Array, required: true }, campaigns: { type: Array, default: () => [] }, promoCode: { type: String, default: '' }, formatPrice: { type: Function, required: true } })
</script>
<template>
  <div v-if="cartItems.length" class="mt-5 space-y-3">
    <CommerceItemCard v-for="item in cartItems" :key="`${item.id}-${item.size}`" :item="item" :campaigns="itemCampaigns(item, campaigns)" :promo-code="promoCode" :format-price="formatPrice" />
  </div>
  <p v-else class="mt-5 text-sm text-stone-600">Your bag is empty. Return to the shop to add treats.</p>
</template>
