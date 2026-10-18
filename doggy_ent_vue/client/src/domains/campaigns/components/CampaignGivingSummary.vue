<script setup>
import { computed } from 'vue'
import { HeartHandshake } from '@lucide/vue'
import { formatCurrency } from '@shared/utils/currency.js'
import { getCampaignContributionLabel } from '../utils/campaignPresentation.js'

const props = defineProps({ campaign: { type: Object, required: true }, title: String, example: Boolean })
const fixed = computed(() => props.campaign.donationType?.toUpperCase() === 'FIXED')
const amount = computed(() => fixed.value ? formatCurrency(Number(props.campaign.donationValue || 0)) : `${Number(props.campaign.donationValue || 0)}%`)
const period = computed(() => [props.campaign.startsAt, props.campaign.endsAt]
  .filter(value => value && Number.isFinite(Date.parse(value)))
  .map(value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })).join(' – '))
</script>

<template>
  <div class="store-inner campaign-impact-inner">
    <div class="campaign-impact-rule" :aria-label="getCampaignContributionLabel(campaign)" :data-contribution-kind="fixed ? 'fixed' : 'percent'">
      <strong>{{ amount }}</strong>
      <span>{{ fixed ? 'per eligible order' : 'of eligible product sales' }}</span>
      <small v-if="!campaign.isActive">Configured rule · giving is not currently active</small>
    </div>
    <div class="campaign-impact-explanation">
      <h2><HeartHandshake :size="20" aria-hidden="true" />{{ title }}</h2>
      <p>Business-funded support for {{ campaign.donationTarget }}. There's no extra donation added to your checkout total.</p>
      <p v-if="!campaign.isActive" class="campaign-status" role="status">{{ campaign.status === 'PAUSED' ? 'Giving is currently paused.' : 'Giving is not currently active.' }} Purchases do not currently contribute.</p>
      <p v-if="example" class="campaign-note">Fictional example rule · no real donation pledge or payout is represented.</p>
      <p v-if="period" class="campaign-note">Campaign dates: {{ period }}</p>
      <p v-if="Number(campaign.donationGenerated) > 0" class="campaign-note">{{ formatCurrency(campaign.donationGenerated) }} generated from eligible orders. Generated contributions are not confirmation of funds paid out.</p>
    </div>
  </div>
</template>

<style scoped>
.campaign-impact-inner { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: center; gap: 28px; padding-block: 26px; }
.campaign-impact-rule { display: grid; gap: 7px; color: var(--store-green); }
.campaign-impact-rule strong { font-size: 38px; line-height: 1.2; font-weight: 750; overflow-wrap: anywhere; }
.campaign-impact-rule span { font-size: 15px; }
.campaign-impact-rule small { font-size: 12px; }
.campaign-impact-explanation { min-width: 0; padding-left: 28px; border-left: 1px solid #c3dacc; }
.campaign-impact-explanation h2 { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 650; line-height: 1.4; color: var(--store-green); }
.campaign-impact-explanation svg { flex-shrink: 0; }
.campaign-impact-explanation p { margin-top: 9px; color: var(--store-muted); font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
.campaign-impact-explanation .campaign-note { font-size: 12px; }
.campaign-status { font-weight: 650; }
@media (max-width: 500px) { .campaign-impact-inner { grid-template-columns: minmax(0, 1fr); gap: 20px; } .campaign-impact-explanation { border-left: 0; border-top: 1px solid #c3dacc; padding: 20px 0 0; } }
@container website-preview (max-width:500px) { .campaign-impact-inner { grid-template-columns: minmax(0, 1fr); gap: 20px; } .campaign-impact-explanation { border-left: 0; border-top: 1px solid #c3dacc; padding: 20px 0 0; } }
</style>
