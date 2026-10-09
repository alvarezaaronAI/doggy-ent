import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
} from '@campaigns/api/campaigns.api'
import { fetchProducts } from '@products/api/products.api.js'

export { createCampaign, deleteCampaign, getCampaigns, updateCampaign }

export async function fetchCampaignProducts() {
  return fetchProducts()
}
