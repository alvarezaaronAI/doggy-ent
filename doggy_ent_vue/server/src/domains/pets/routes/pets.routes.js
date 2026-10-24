import { Router, raw } from 'express'
import { createRateLimiter } from '../../../app/middleware/security/rateLimit.middleware.js'
import {
  createPetController,
  deletePetController,
  listPetsController,
  updatePetController,
  archivePetController,
  uploadPetPhotoController,
  getPetPhotoController,
  deletePetPhotoController,
} from '../controllers/pets.controller.js'
import { MAX_PET_PHOTO_UPLOAD_BYTES, PET_PHOTO_TYPES } from '../constants/pets.constants.js'

const router = Router()
const mutationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many pet profile changes. Please try again shortly.',
})

router.get('/', listPetsController)
router.post('/', mutationLimiter, createPetController)
router.put('/:id', mutationLimiter, updatePetController)
router.delete('/:id', mutationLimiter, deletePetController)
router.patch('/:id/archive', mutationLimiter, archivePetController)
router.get('/:id/photo', getPetPhotoController)
router.put('/:id/photo', mutationLimiter, raw({
  type: PET_PHOTO_TYPES, limit: MAX_PET_PHOTO_UPLOAD_BYTES, inflate: false,
}), uploadPetPhotoController)
router.delete('/:id/photo', mutationLimiter, deletePetPhotoController)

router.use((error, _req, res, next) => {
  if (error.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Photos must be 5 MB or smaller.' })
  if (error.type === 'encoding.unsupported') return res.status(415).json({ success: false, message: 'Compressed photo uploads are not supported.' })
  return next(error)
})

export default router
