<script setup>
import { computed } from 'vue'
import CommerceGivingNote from '@shared/components/CommerceGivingNote.vue'
import { mapGivingCampaigns } from '@shared/mappers/commerceItem.mapper.js'

const props = defineProps({
  isLoadingCampaignPreview: Boolean,
  campaignPreview: { type: Array, default: () => [] },
  publicCampaigns: { type: Array, default: () => [] },
  amount: { type: Number, default: 0 },
  formatPrice: { type: Function, required: true },
})
const campaigns = computed(() => mapGivingCampaigns(props.campaignPreview, props.publicCampaigns))
</script>

<template>
  <p v-if="isLoadingCampaignPreview" class="text-xs text-stone-600" role="status">
    Checking giving from eligible items. This does not add a charge.
  </p>
  <CommerceGivingNote v-else :amount="amount" :campaigns="campaigns" :format-price="formatPrice" estimated />
</template>
