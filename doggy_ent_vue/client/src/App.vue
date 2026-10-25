<script setup>
import { defineAsyncComponent } from 'vue'
import CampaignQuickView from '@campaigns/components/CampaignQuickView.vue'
import '@storefront/styles/storefront.css'
const DevelopmentRoutingPanel = import.meta.env.DEV
  ? defineAsyncComponent(() => import('@shared/components/DevelopmentRoutingPanel.vue'))
  : null
</script>
<template>
  <div data-app-frame class="store-pattern flex min-h-dvh flex-col">
    <DevelopmentRoutingPanel v-if="DevelopmentRoutingPanel" />
    <div data-page-frame class="flex min-w-0 flex-1 flex-col"><router-view /></div>
    <CampaignQuickView />
  </div>
</template>
