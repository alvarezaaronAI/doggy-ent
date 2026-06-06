

import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const CAMPAIGNS_API_URL = '/api/admin/campaigns'
const PUBLIC_CAMPAIGNS_API_URL = '/api/campaigns'

async function parseResponse(response, fallbackMessage) {
  return parseJsonResponse(response, fallbackMessage)
}

export async function getCampaigns() {
  const response = await fetchApi(CAMPAIGNS_API_URL)

  const data = await parseResponse(
    response,
    'Unable to load campaigns.',
  )

  return Array.isArray(data.campaigns)
    ? data.campaigns
    : []
}

export async function createCampaign(payload) {
  const response = await fetchApi(
    CAMPAIGNS_API_URL,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),
    },
  )

  const data = await parseResponse(
    response,
    'Unable to create campaign.',
  )

  return data.campaign
}

export async function updateCampaign(
  campaignId,
  payload,
) {
  const response = await fetchApi(
    `${CAMPAIGNS_API_URL}/${campaignId}`,
    {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),
    },
  )

  const data = await parseResponse(
    response,
    'Unable to update campaign.',
  )

  return data.campaign
}

export async function previewCampaigns(cartItems = []) {
  const response = await fetchApi(
    `${PUBLIC_CAMPAIGNS_API_URL}/preview`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        cartItems,
      }),
    },
  )

  const data = await parseResponse(
    response,
    'Unable to preview campaigns.',
  )

  return Array.isArray(data.campaigns)
    ? data.campaigns
    : []
}

export async function deleteCampaign(campaignId) {
  const response = await fetchApi(
    `${CAMPAIGNS_API_URL}/${campaignId}`,
    {
      method: 'DELETE',
    },
  )

  if (response.status === 204) {
    return true
  }

  await parseResponse(
    response,
    'Unable to delete campaign.',
  )

  return true
}
