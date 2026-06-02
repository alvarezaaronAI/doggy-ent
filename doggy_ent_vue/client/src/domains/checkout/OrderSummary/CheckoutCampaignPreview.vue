

<script setup>
defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  isLoadingCampaignPreview: {
    type: Boolean,
    required: true,
  },
  campaignPreview: {
    type: Array,
    required: true,
  },
  totalCampaignDonation: {
    type: Number,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <div
    v-if="isLoadingCampaignPreview"
    class="mt-5 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4 text-sm font-semibold text-stone-400"
  >
    Checking donation campaigns...
  </div>

  <div
    v-else-if="cartItems.length && campaignPreview.length"
    class="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800"
  >
    <div class="flex items-start gap-3">
      <i class="fa-solid fa-shield-dog mt-1 text-emerald-400"></i>
      <div>
        <p class="font-extrabold">This order helps dogs in need</p>
        <p class="mt-1 text-sm">
          Estimated donation from eligible items: {{ formatPrice(totalCampaignDonation) }}
        </p>
      </div>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-for="campaign in campaignPreview"
        :key="campaign.campaignId"
        class="rounded-xl bg-white/70 p-3 text-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-bold leading-tight">{{ campaign.campaignName }}</p>
            <p class="mt-1 text-xs opacity-80">
              Supports {{ campaign.donationTarget }}
            </p>
          </div>

          <p class="font-extrabold">
            {{ formatPrice(campaign.donationAmount) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>