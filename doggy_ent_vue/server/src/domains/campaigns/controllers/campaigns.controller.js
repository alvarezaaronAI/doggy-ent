

import {
  createCampaign,
  deleteCampaignById,
  getAllCampaigns,
  getCampaignById,
  previewCampaignDonations,
  updateCampaignById,
} from '../services/campaigns.service.js'

export async function getCampaignsController(
  request,
  reply,
) {
  const campaigns = await getAllCampaigns()

  return reply.send({
    campaigns,
  })
}

export async function getCampaignByIdController(
  request,
  reply,
) {
  const campaign = await getCampaignById(
    request.params.campaignId,
  )

  if (!campaign) {
    return reply.code(404).send({
      error: 'Campaign not found.',
    })
  }

  return reply.send({
    campaign,
  })
}

export async function createCampaignController(
  request,
  reply,
) {
  const campaign = await createCampaign(request.body)

  return reply.code(201).send({
    campaign,
  })
}

export async function updateCampaignController(
  request,
  reply,
) {
  const campaign = await updateCampaignById(
    request.params.campaignId,
    request.body,
  )

  return reply.send({
    campaign,
  })
}

export async function deleteCampaignController(
  request,
  reply,
) {
  await deleteCampaignById(
    request.params.campaignId,
  )

  return reply.code(204).send()
}

export async function previewCampaignsController(
  request,
  reply,
) {
  const preview = await previewCampaignDonations(
    request.body.cartItems || [],
  )

  return reply.send({
    campaigns: preview,
  })
}