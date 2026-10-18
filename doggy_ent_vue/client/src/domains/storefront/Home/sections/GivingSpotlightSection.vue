<script setup>
import { computed } from "vue";
import { ArrowUpRight, HeartHandshake } from "@lucide/vue";
import { useStorefrontCampaigns } from "@campaigns/composables/useStorefrontCampaigns.js";
import { getCampaignContributionLabel } from "@campaigns/utils/campaignPresentation.js";
import { BRAND_IMAGES } from "../../constants/brandContent.js";
import StorefrontStoryCard from "../../components/StorefrontStoryCard.vue";
defineProps({ settings: Object });
const { campaigns } = useStorefrontCampaigns();
const campaign = computed(() =>
  campaigns.value.find((item) => item.isActive && item.pageAvailable),
);
</script>
<template>
  <section v-if="campaign" class="store-section">
    <div class="store-inner">
      <header class="story-heading">
        <h2>{{ settings.title }}</h2>
        <p>{{ settings.text }}</p>
      </header>
      <div class="story-grid">
        <StorefrontStoryCard
          :image="BRAND_IMAGES.campaign"
          alt="Illustrative black Labrador on a walking trail"
          caption="Campaign photograph template · replace with approved partner photography"
        /><StorefrontStoryCard
          giving
          title="A little support for a fresh start."
          :text="campaign.description"
          ><p>{{ campaign.name }} supports {{ campaign.donationTarget }}.</p>
          <div class="mt-5 flex items-center gap-3 text-[#17634c]">
            <HeartHandshake :size="30" class="shrink-0" /><strong>{{
              getCampaignContributionLabel(campaign)
            }}</strong>
          </div>
          <p>No extra donation at checkout.</p>
          <RouterLink
            :to="'/campaigns/' + campaign.slug"
            class="store-button mt-6"
            >Meet this campaign <ArrowUpRight :size="16" /></RouterLink
        ></StorefrontStoryCard>
      </div>
    </div>
  </section>
</template>
