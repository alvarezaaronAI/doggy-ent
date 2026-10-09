<script setup>
import { ArrowUpRight, HeartHandshake } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { getCampaignContributionLabel } from '@campaigns/utils/campaignPresentation.js'
defineProps({ campaigns: { type: Array, default: () => [] } })
</script>
<template>
  <div v-if="campaigns.length" class="mt-4">
    <component
      :is="campaign.pageAvailable ? RouterLink : 'div'"
      v-for="campaign in campaigns"
      :key="campaign.id"
      :to="
        campaign.pageAvailable
          ? { name: 'campaign-detail', params: { slug: campaign.slug } }
          : undefined
      "
      class="store-campaign-link"
    >
      <HeartHandshake :size="18" class="shrink-0" aria-hidden="true" />
      <span class="min-w-0 flex-1"
        ><strong class="block text-sm font-semibold break-words">{{
          campaign.name
        }}</strong
        ><span class="block text-xs store-muted"
          >{{ getCampaignContributionLabel(campaign)
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
