import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
} from '@campaigns/api/campaigns.api'

const PRODUCTS_API_URL = '/api/products'

export {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
}

export async function fetchCampaignProducts() {
  const response = await fetch(PRODUCTS_API_URL)

  if (!response.ok) {
    throw new Error('Unable to load products.')
  }

  return response.json()
}
