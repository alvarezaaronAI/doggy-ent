import { Router } from 'express'
import { createRateLimiter } from '../../../app/middleware/security/rateLimit.middleware.js'
import {
  listWishlistController,
  removeWishlistController,
  saveWishlistController,
} from '../controllers/wishlist.controller.js'

const router = Router()
const mutationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many wishlist changes. Please try again shortly.',
})

router.use((_req, res, next) => {
  res.set('Cache-Control', 'private, no-store')
  next()
})
router.get('/', listWishlistController)
router.put('/:productId', mutationLimiter, saveWishlistController)
router.delete('/:productId', mutationLimiter, removeWishlistController)

export default router
