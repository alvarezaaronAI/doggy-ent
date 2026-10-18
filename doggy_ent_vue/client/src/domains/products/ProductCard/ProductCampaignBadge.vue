<script setup>
import { ArrowUpRight, HeartHandshake } from '@lucide/vue'
import { getCampaignContributionLabel } from '@campaigns/utils/campaignPresentation.js'
import { useCampaignQuickView } from '@campaigns/composables/useCampaignQuickView.js'
const { openCampaign } = useCampaignQuickView()
defineProps({ campaigns: { type: Array, default: () => [] }, compact: Boolean })
</script>
<template>
  <div v-if="campaigns.length" :class="compact ? 'product-giving-strip' : 'mt-4'">
    <component
      :is="campaign.pageAvailable ? 'button' : 'div'"
      v-for="campaign in campaigns"
      :key="campaign.id"
      class="store-campaign-link"
      :title="compact ? (campaign.name || campaign.campaignName) + ' · ' + getCampaignContributionLabel(campaign) : undefined"
      :type="campaign.pageAvailable ? 'button' : undefined"
      @click="openCampaign(campaign)"
    >
      <HeartHandshake :size="18" class="shrink-0" aria-hidden="true" />
      <span v-if="compact" class="min-w-0 flex-1 text-xs">{{ (campaign.name || campaign.campaignName || '').startsWith('[TEST]') ? 'Part of the sample campaign' : 'Part of a giving campaign' }}</span>
      <span v-else class="min-w-0 flex-1"
        ><strong class="block text-sm font-semibold break-words">{{
          campaign.name || campaign.campaignName
        }}</strong
        ><span class="block text-xs store-muted"
          >{{ campaign.donationType ? getCampaignContributionLabel(campaign) : 'This purchase supports giving'
          }}<span v-if="campaign.donationTarget">
            supports {{ campaign.donationTarget }}</span
          ></span
        ></span
      >
      <ArrowUpRight
        v-if="campaign.pageAvailable"
        :size="18"
        class="shrink-0"
        aria-hidden="true"
      />
    </component>
  </div>
</template>
<style scoped>
.product-giving-strip { margin-top:auto; }
.product-giving-strip .store-campaign-link { margin:0; width:100%; min-height:40px; padding:8px 13px; border:0; border-top:1px solid #c8e1d2; border-radius:0; gap:6px; }
</style>
