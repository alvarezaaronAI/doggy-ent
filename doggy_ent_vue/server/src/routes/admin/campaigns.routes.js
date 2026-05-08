import express from 'express'

import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaignById,
  deleteCampaignById,
  previewCampaignDonations,
  recordCampaignDonationUsage,
} from '../../services/admin/campaigns.service.js'
import { requireAdminAuth } from '../../middleware/auth/requireAdminAuth.js'

const router = express.Router()

// Admin CRUD routes
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const campaigns = await getAllCampaigns()
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaigns.' })
  }
})

router.get('/:campaignId', requireAdminAuth, async (req, res) => {
  try {
    const campaign = await getCampaignById(req.params.campaignId)

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' })
    }

    res.json(campaign)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaign.' })
  }
})

router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const campaign = await createCampaign(req.body)
    res.status(201).json(campaign)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to create campaign.' })
  }
})

router.put('/:campaignId', requireAdminAuth, async (req, res) => {
  try {
    const campaign = await updateCampaignById(req.params.campaignId, req.body)
    res.json(campaign)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to update campaign.' })
  }
})

router.delete('/:campaignId', requireAdminAuth, async (req, res) => {
  try {
    const campaign = await deleteCampaignById(req.params.campaignId)
    res.json(campaign)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to delete campaign.' })
  }
})

// Public preview route (used in checkout later)
router.post('/preview', async (req, res) => {
  try {
    const { cartItems } = req.body

    const result = await previewCampaignDonations(cartItems || [])
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Failed to preview campaign donations.' })
  }
})

// Record campaign usage after successful order
router.post('/record-usage', async (req, res) => {
  try {
    const { campaigns } = req.body

    if (!Array.isArray(campaigns)) {
      return res.status(400).json({ message: 'Campaigns payload must be an array.' })
    }

    const results = []

    for (const campaign of campaigns) {
      const updated = await recordCampaignDonationUsage({
        campaignId: campaign.campaignId,
        subtotal: campaign.matchedSubtotal,
      })

      if (updated) {
        results.push(updated)
      }
    }

    res.json({ success: true, updatedCampaigns: results })
  } catch (error) {
    res.status(500).json({ message: 'Failed to record campaign usage.' })
  }
})

export default router