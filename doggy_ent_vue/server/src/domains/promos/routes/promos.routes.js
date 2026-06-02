import express from 'express'
import rateLimit from 'express-rate-limit'
import {
  createPromo,
  deletePromoById,
  getAllPromos,
  getPromoAnalytics,
  getPromoById,
  updatePromoById,
  validatePromoCode,
} from '../services/promos.service.js'
import {
  requireAdminAuth,
} from '../../../app/middleware/auth/requireAdminAuth.js'

const router = express.Router()

const promoValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    valid: false,
    message: 'Too many promo attempts. Please try again later.',
    discountAmount: 0,
  },
})

router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const promos = await getAllPromos()

    res.json(promos)
  }
  catch (error) {
    next(error)
  }
})

router.get(
  '/:promoId/analytics',
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const analytics = await getPromoAnalytics(req.params.promoId)

      res.json(analytics)
    }
    catch (error) {
      next(error)
    }
  },
)

router.get('/:promoId', requireAdminAuth, async (req, res, next) => {
  try {
    const promo = await getPromoById(req.params.promoId)

    if (!promo) {
      return res.status(404).json({ message: 'Promo not found.' })
    }

    return res.json(promo)
  }
  catch (error) {
    return next(error)
  }
})

router.post('/', requireAdminAuth, async (req, res, next) => {
  try {
    const promo = await createPromo(req.body)

    return res.status(201).json(promo)
  }
  catch (error) {
    return next(error)
  }
})

router.put('/:promoId', requireAdminAuth, async (req, res, next) => {
  try {
    const promo = await updatePromoById(req.params.promoId, req.body)

    return res.json(promo)
  }
  catch (error) {
    return next(error)
  }
})

router.delete('/:promoId', requireAdminAuth, async (req, res, next) => {
  try {
    const promo = await deletePromoById(req.params.promoId)

    return res.json(promo)
  }
  catch (error) {
    return next(error)
  }
})

router.post(
  '/validate',
  promoValidationLimiter,
  async (req, res, next) => {
    try {
      const result = await validatePromoCode(req.body)

      return res.status(result.valid ? 200 : 400).json(result)
    }
    catch (error) {
      return next(error)
    }
  },
)

export default router
