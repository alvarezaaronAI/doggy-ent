

const CAMPAIGNS_API_URL = '/api/admin/campaigns'
const PUBLIC_CAMPAIGNS_API_URL = '/api/campaigns'

async function parseResponse(response, fallbackMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.message || fallbackMessage,
    )
  }

  return data
}

export async function getCampaigns() {
  const response = await fetch(CAMPAIGNS_API_URL)

  const data = await parseResponse(
    response,
    'Unable to load campaigns.',
  )

  return Array.isArray(data.campaigns)
    ? data.campaigns
    : []
}

export async function createCampaign(payload) {
  const response = await fetch(
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
  const response = await fetch(
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
  const response = await fetch(
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

export async function recordCampaignUsage(
  campaigns = [],
) {
  const response = await fetch(
    `${PUBLIC_CAMPAIGNS_API_URL}/record-usage`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        campaigns,
      }),
    },
  )

  const data = await parseResponse(
    response,
    'Unable to record campaign usage.',
  )

  return Array.isArray(data.updatedCampaigns)
    ? data.updatedCampaigns
    : []
}

export async function deleteCampaign(campaignId) {
  const response = await fetch(
    `${CAMPAIGNS_API_URL}/${campaignId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok && response.status !== 204) {
    let data = null

    try {
      data = await response.json()
    } catch {
      data = null
    }

    throw new Error(
      data?.message
      || 'Unable to delete campaign.',
    )
  }

  return true
}