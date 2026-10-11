<script setup>
import { computed } from 'vue'
import { HeartHandshake, ArrowRight } from '@lucide/vue'
import { useCampaignQuickView } from '@domains/campaigns/composables/useCampaignQuickView.js'
import { givingBeneficiaries } from '@domains/storefront/content/commercePresentation.js'
import { formatCurrency } from '@shared/utils/currency.js'

const props = defineProps({
  amount: { type: Number, default: 0 },
  campaigns: { type: Array, default: () => [] },
  formatPrice: { type: Function, default: formatCurrency },
  estimated: Boolean,
  interactive: { type: Boolean, default: true },
})
const beneficiaries = computed(() => givingBeneficiaries(props.campaigns))
const publicCampaigns = computed(() => props.campaigns.filter((campaign, index, all) =>
  campaign.pageAvailable === true && campaign.slug && all.findIndex(candidate => candidate.slug === campaign.slug) === index))
const { openCampaign } = useCampaignQuickView()
</script>

<template>
  <section v-if="amount > 0" aria-label="Giving at no extra cost" class="rounded-lg border border-[#c6dfd2] bg-[#edf6f0] p-5 text-[#17634c] shadow-[0_8px_24px_#24352d0a]">
    <div class="flex items-center gap-2 text-xs font-semibold">
      <HeartHandshake :size="18" class="shrink-0" aria-hidden="true" />A little good, together
    </div>
    <h3 class="mt-3 text-lg font-semibold">Your order makes a difference</h3>
    <p class="mt-4 text-3xl font-semibold tabular-nums">{{ formatPrice(amount) }}</p>
    <p class="mt-1 text-xs">{{ estimated ? 'Estimated contribution from eligible items' : 'Our contribution from eligible items' }}</p>
    <p class="mt-4 text-sm leading-relaxed">Supporting {{ beneficiaries }}</p>
    <p class="mt-3 border-t border-[#c6dfd2] pt-3 text-xs leading-relaxed">No extra cost to you. Funded by Chase &amp; Evie Co., not added to your bill.</p>
    <div v-if="interactive && publicCampaigns.length" class="mt-4 flex flex-col gap-2">
      <button v-for="campaign in publicCampaigns" :key="campaign.slug" type="button" class="inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-[#b8d5c7] bg-white/70 px-3 py-2 text-left text-sm font-semibold transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315bc5]" aria-haspopup="dialog" @click="openCampaign(campaign)">
        <span class="min-w-0 break-words">About {{ campaign.campaignName || campaign.name || campaign.campaign?.name || 'this campaign' }}</span><ArrowRight :size="16" class="shrink-0" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>
