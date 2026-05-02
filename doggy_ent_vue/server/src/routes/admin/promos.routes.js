

import express from 'express'
import {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromoById,
  deletePromoById,
  validatePromoCode,
} from '../../services/admin/promos.service.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const promos = await getAllPromos()
    res.json(promos)
  } catch (error) {
    next(error)
  }
})

router.get('/:promoId', async (req, res, next) => {
  try {
    const promo = await getPromoById(req.params.promoId)

    if (!promo) {
      return res.status(404).json({ message: 'Promo not found.' })
    }

    res.json(promo)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const promo = await createPromo(req.body)
    res.status(201).json(promo)
  } catch (error) {
    next(error)
  }
})

router.put('/:promoId', async (req, res, next) => {
  try {
    const promo = await updatePromoById(req.params.promoId, req.body)
    res.json(promo)
  } catch (error) {
    next(error)
  }
})

router.delete('/:promoId', async (req, res, next) => {
  try {
    const promo = await deletePromoById(req.params.promoId)
    res.json(promo)
  } catch (error) {
    next(error)
  }
})

router.post('/validate', async (req, res, next) => {
  try {
    const result = await validatePromoCode(req.body)
    res.status(result.valid ? 200 : 400).json(result)
  } catch (error) {
    next(error)
  }
})

export default router