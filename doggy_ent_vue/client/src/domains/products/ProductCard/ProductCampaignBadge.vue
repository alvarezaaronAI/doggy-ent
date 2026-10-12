<script setup>
import { ArrowUpRight, HeartHandshake } from '@lucide/vue'
import { getCampaignContributionLabel } from '@campaigns/utils/campaignPresentation.js'
import { useCampaignQuickView } from '@campaigns/composables/useCampaignQuickView.js'
const { openCampaign } = useCampaignQuickView()
defineProps({ campaigns: { type: Array, default: () => [] } })
</script>
<template>
  <div v-if="campaigns.length" class="mt-4">
    <component
      :is="campaign.pageAvailable ? 'button' : 'div'"
      v-for="campaign in campaigns"
      :key="campaign.id"
      class="store-campaign-link"
      :type="campaign.pageAvailable ? 'button' : undefined"
      @click="openCampaign(campaign)"
    >
      <HeartHandshake :size="18" class="shrink-0" aria-hidden="true" />
      <span class="min-w-0 flex-1"
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
