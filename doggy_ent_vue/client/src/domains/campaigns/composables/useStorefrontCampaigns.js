import { ref } from 'vue'
import { fetchStorefrontCampaigns } from '../api/publicCampaigns.api.js'
import { getCampaignsForProduct } from '../utils/campaignPresentation.js'

const campaigns = ref([])
const error = ref('')
let pending = null
export function useStorefrontCampaigns() {
  async function loadCampaigns() {
    if (pending) return pending
    pending = (async () => {
    try {
      campaigns.value = await fetchStorefrontCampaigns()
      error.value = ''
    } catch (e) {
      campaigns.value = []
      error.value = e.message
    }
    })()
    try { await pending } finally { pending = null }
  }
  return {
    campaigns,
    error,
    loadCampaigns,
    campaignsForProduct: (product) =>
      getCampaignsForProduct(campaigns.value, product?.id),
  }
}
