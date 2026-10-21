<script setup>
import { defineAsyncComponent } from 'vue'
import CampaignQuickView from '@campaigns/components/CampaignQuickView.vue'
const DevelopmentRoutingPanel = import.meta.env.DEV
  ? defineAsyncComponent(() => import('@shared/components/DevelopmentRoutingPanel.vue'))
  : null
</script>
<template>
  <DevelopmentRoutingPanel v-if="DevelopmentRoutingPanel" />
  <router-view />
  <CampaignQuickView />
</template>
