

import express from 'express'

import {
  createCampaignController,
  deleteCampaignController,
  getCampaignByIdController,
  getCampaignsController,
  previewCampaignsController,
  updateCampaignController,
} from '../controllers/campaigns.controller.js'

import {
  recordCampaignDonationUsage,
} from '../services/campaigns.service.js'

import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'

const router = express.Router()
// Public commerce campaign routes

// Admin campaign management routes
router.get(
  '/',
  requireAdminAuth,
  getCampaignsController,
)

router.post(
  '/preview',
  previewCampaignsController,
)

router.get(
  '/:campaignId',
  requireAdminAuth,
  getCampaignByIdController,
)

router.post(
  '/',
  requireAdminAuth,
  createCampaignController,
)

router.put(
  '/:campaignId',
  requireAdminAuth,
  updateCampaignController,
)

router.delete(
  '/:campaignId',
  requireAdminAuth,
  deleteCampaignController,
)



router.post(
  '/record-usage',
  requireAdminAuth,
  async (req, res) => {
    try {
      const { campaigns } = req.body

      if (!Array.isArray(campaigns)) {
        return res.status(400).json({
          message:
            'Campaigns payload must be an array.',
        })
      }

      const results = []

      for (const campaign of campaigns) {
        const updated =
          await recordCampaignDonationUsage({
            campaignId: campaign.campaignId,
            subtotal: campaign.matchedSubtotal,
          })

        if (updated) {
          results.push(updated)
        }
      }

      return res.json({
        success: true,
        updatedCampaigns: results,
      })
    } catch (error) {
      return res.status(500).json({
        message:
          'Failed to record campaign usage.',
      })
    }
  },
)

export default router
