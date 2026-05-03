

import express from 'express'

import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaignById,
  deleteCampaignById,
  previewCampaignDonations,
} from '../../services/admin/campaigns.service.js'

const router = express.Router()

// Admin CRUD routes
router.get('/', async (req, res) => {
  try {
    const campaigns = await getAllCampaigns()
    res.json(campaigns)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaigns.' })
  }
})

router.get('/:campaignId', async (req, res) => {
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

router.post('/', async (req, res) => {
  try {
    const campaign = await createCampaign(req.body)
    res.status(201).json(campaign)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to create campaign.' })
  }
})

router.put('/:campaignId', async (req, res) => {
  try {
    const campaign = await updateCampaignById(req.params.campaignId, req.body)
    res.json(campaign)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Failed to update campaign.' })
  }
})

router.delete('/:campaignId', async (req, res) => {
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

export default router