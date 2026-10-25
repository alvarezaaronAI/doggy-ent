import { ref, watch } from 'vue'
import { fetchPublicCampaign } from '../api/publicCampaigns.api.js'

export function useCampaignPage(slug) {
  const campaign = ref(null)
  const loading = ref(true)
  const error = ref('')
  const errorKind = ref('')
  let request = 0
  async function load() {
    const current = ++request
    if (!slug.value) { campaign.value = null; loading.value = false; error.value = ''; errorKind.value = ''; return }
    loading.value = true
    campaign.value = null
    error.value = ''
    errorKind.value = ''
    try {
      const result = await fetchPublicCampaign(slug.value)
      if (!result) throw new Error('Campaign response missing.')
      if (current === request) campaign.value = result
    } catch (e) {
      if (current === request) {
        errorKind.value = e.status === 404 ? 'campaign-not-found' : 'unavailable'
        error.value = e.status === 404 ? 'This campaign is not available at this link.' : 'We could not load this campaign. Please try again.'
      }
    } finally {
      if (current === request) loading.value = false
    }
  }
  watch(slug, load, { immediate: true })
  return { campaign, loading, error, errorKind, load }
}
