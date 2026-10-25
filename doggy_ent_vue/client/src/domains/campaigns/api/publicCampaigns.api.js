import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

export async function fetchStorefrontCampaigns() {
  const data = await parseJsonResponse(
    await fetchApi('/api/campaigns/public'),
    'Unable to load giving campaigns.',
  )
  return Array.isArray(data.campaigns) ? data.campaigns : []
}

export async function fetchPublicCampaign(slug) {
  const response = await fetchApi(`/api/campaigns/public/${encodeURIComponent(slug)}`)
  try {
    const data = await parseJsonResponse(response, 'Unable to load this campaign.')
    return data.campaign
  } catch (error) { error.status = response.status; throw error }
}
