import { computed, ref, watch } from 'vue'
import { fetchPublicCampaign } from '@campaigns/api/publicCampaigns.api.js'
export function useWebsiteCampaignPreview(campaigns, selectedId) {
  const selected = computed(() => campaigns.value.find(item => item.id === selectedId.value) || campaigns.value[0])
  const campaign = ref(null), error = ref('')
  let request = 0
  watch(selected, async item => {
    const generation = ++request
    campaign.value = null; error.value = ''
    if (!item?.pageAvailable) { if (item) error.value = 'Enable the public page in Catalog → Campaigns to preview it here.'; return }
    try { const value = await fetchPublicCampaign(item.slug); if (generation === request) campaign.value = value }
    catch (e) { if (generation === request) error.value = e.message }
  }, { immediate: true })
  return { campaign, campaignPreviewError: error }
}
