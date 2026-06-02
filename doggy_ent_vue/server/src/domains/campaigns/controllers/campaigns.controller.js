

import {
  createCampaign,
  deleteCampaignById,
  getAllCampaigns,
  getCampaignById,
  previewCampaignDonations,
  updateCampaignById,
} from '../services/campaigns.service.js'

export async function getCampaignsController(
  req,
  res,
  next,
) {
  try {
    const campaigns = await getAllCampaigns()

    return res.json({
      campaigns,
    })
  }
  catch (error) {
    return next(error)
  }
}

export async function getCampaignByIdController(
  req,
  res,
  next,
) {
  try {
    const campaign = await getCampaignById(
      req.params.campaignId,
    )

    if (!campaign) {
      return res.status(404).json({
        message: 'Campaign not found.',
      })
    }

    return res.json({
      campaign,
    })
  }
  catch (error) {
    return next(error)
  }
}

export async function createCampaignController(
  req,
  res,
  next,
) {
  try {
    const campaign = await createCampaign(req.body)

    return res.status(201).json({
      campaign,
    })
  }
  catch (error) {
    return next(error)
  }
}

export async function updateCampaignController(
  req,
  res,
  next,
) {
  try {
    const campaign = await updateCampaignById(
      req.params.campaignId,
      req.body,
    )

    return res.json({
      campaign,
    })
  }
  catch (error) {
    return next(error)
  }
}

export async function deleteCampaignController(
  req,
  res,
  next,
) {
  try {
    await deleteCampaignById(
      req.params.campaignId,
    )

    return res.status(204).send()
  }
  catch (error) {
    return next(error)
  }
}

export async function previewCampaignsController(
  req,
  res,
  next,
) {
  try {
    const preview = await previewCampaignDonations(
      req.body.cartItems || [],
    )

    return res.json({
      campaigns: preview,
    })
  }
  catch (error) {
    return next(error)
  }
}
