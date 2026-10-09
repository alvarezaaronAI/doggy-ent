import { ref } from 'vue'
import { fetchStorefrontCampaigns } from '../api/publicCampaigns.api.js'
import { getCampaignsForProduct } from '../utils/campaignPresentation.js'

export function useStorefrontCampaigns() {
  const campaigns = ref([])
  const error = ref('')
  async function loadCampaigns() {
    try {
      campaigns.value = await fetchStorefrontCampaigns()
      error.value = ''
    } catch (e) {
      campaigns.value = []
      error.value = e.message
    }
  }
  return {
    campaigns,
    error,
    loadCampaigns,
    campaignsForProduct: (product) =>
      getCampaignsForProduct(campaigns.value, product?.id),
  }
}
