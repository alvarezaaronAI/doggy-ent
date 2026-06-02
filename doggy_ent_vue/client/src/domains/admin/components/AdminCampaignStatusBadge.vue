<script setup>
import {
  getCampaignStatusClass,
} from '../utils/adminCampaigns.utils'

defineProps({
  status: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span class="rounded-full px-3 py-1 text-xs font-bold" :class="getCampaignStatusClass(status)">
    {{ status }}
  </span>
</template>
