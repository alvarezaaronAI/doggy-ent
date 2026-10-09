import { ref, watch } from 'vue'
import { fetchPublicCampaign } from '../api/publicCampaigns.api.js'

export function useCampaignPage(slug) {
  const campaign = ref(null)
  const loading = ref(true)
  const error = ref('')
  let request = 0
  async function load() {
    const current = ++request
    loading.value = true
    campaign.value = null
    error.value = ''
    try {
      const result = await fetchPublicCampaign(slug.value)
      if (current === request) campaign.value = result
    } catch (e) {
      if (current === request)
        error.value = e.message || 'This campaign is not available.'
    } finally {
      if (current === request) loading.value = false
    }
  }
  watch(slug, load, { immediate: true })
  return { campaign, loading, error, load }
}
