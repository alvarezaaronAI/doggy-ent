import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
} from '@campaigns/api/campaigns.api'
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const PRODUCTS_API_URL = '/api/products'

export {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
}

export async function fetchCampaignProducts() {
  return parseJsonResponse(
    await fetchApi(PRODUCTS_API_URL),
    'Unable to load products.',
  )
}
