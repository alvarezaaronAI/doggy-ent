import { apiError } from '../../../shared/utils/apiError.js'
import {
  createCustomerPet,
  deleteCustomerPet,
  getCustomerPets,
  updateCustomerPet,
  archiveCustomerPet,
  uploadCustomerPetPhoto,
  getCustomerPetPhoto,
  deleteCustomerPetPhoto,
} from '../services/pets.service.js'
import { validateEmptyPetInput } from '../validators/pets.validator.js'

function handlePetError(res, error, message) {
  const failure = apiError(error, message)
  return res.status(failure.statusCode).json({ success: false, message: failure.message })
}

export async function listPetsController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    validateEmptyPetInput(req.body)
    const result = await getCustomerPets(req.customerUser?.id)
    return res.json({ success: true, result })
  }
  catch (error) {
    return handlePetError(res, error, 'Unable to load pets.')
  }
}

export async function createPetController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    const result = await createCustomerPet(req.customerUser?.id, req.body)
    return res.status(201).json({ success: true, result })
  }
  catch (error) {
    return handlePetError(res, error, 'Unable to save pet.')
  }
}

export async function updatePetController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    const result = await updateCustomerPet(req.customerUser?.id, req.params.id, req.body)
    return res.json({ success: true, result })
  }
  catch (error) {
    return handlePetError(res, error, 'Unable to update pet.')
  }
}

export async function deletePetController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    const result = await deleteCustomerPet(req.customerUser?.id, req.params.id, req.body)
    return res.json({ success: true, result })
  }
  catch (error) {
    return handlePetError(res, error, 'Unable to remove pet.')
  }
}

export async function archivePetController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    const result = await archiveCustomerPet(req.customerUser?.id, req.params.id, req.body)
    return res.json({ success: true, result })
  }
  catch (error) { return handlePetError(res, error, 'Unable to update pet archive.') }
}

export async function uploadPetPhotoController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    const type = req.get('Content-Type')?.split(';')[0].trim().toLowerCase()
    const result = await uploadCustomerPetPhoto(req.customerUser?.id, req.params.id, req.body, type)
    return res.json({ success: true, result })
  }
  catch (error) { return handlePetError(res, error, 'Unable to save pet photo.') }
}

export async function getPetPhotoController(req, res) {
  res.set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' })
  try {
    validateEmptyPetInput(req.query)
    const photo = await getCustomerPetPhoto(req.customerUser?.id, req.params.id, req.body)
    return res.type(photo.contentType).send(photo.bytes)
  }
  catch (error) { return handlePetError(res, error, 'Unable to load pet photo.') }
}

export async function deletePetPhotoController(req, res) {
  try {
    validateEmptyPetInput(req.query)
    const result = await deleteCustomerPetPhoto(req.customerUser?.id, req.params.id, req.body)
    return res.json({ success: true, result })
  }
  catch (error) { return handlePetError(res, error, 'Unable to remove pet photo.') }
}
