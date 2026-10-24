import { MAX_PETS_PER_CUSTOMER } from '../constants/pets.constants.js'
import { mapPet } from '../mappers/pets.mapper.js'
import {
  createCustomerPetWithinLimit,
  deleteCustomerPetById,
  findCustomerPets,
  updateCustomerPetById,
  archiveCustomerPetById,
  changeCustomerPetPhoto,
  findCustomerPetById,
  findCustomerPetPhoto,
} from '../repositories/pets.repository.js'
import {
  validateEmptyPetInput,
  validatePetId,
  validatePetInput,
  validatePetArchiveInput,
} from '../validators/pets.validator.js'
import { normalizePetPhoto } from './petPhoto.service.js'

function requireOwner(userId) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw Object.assign(new Error('Customer authentication required.'), { statusCode: 401 })
  }
}

function requirePet(pet) {
  if (!pet) throw Object.assign(new Error('Pet not found.'), { statusCode: 404 })
  return pet
}

export async function getCustomerPets(userId) {
  requireOwner(userId)
  return (await findCustomerPets(userId)).map(mapPet)
}

export async function createCustomerPet(userId, input) {
  requireOwner(userId)
  const data = validatePetInput(input)
  const pet = await createCustomerPetWithinLimit(userId, data)
  if (!pet) {
    throw Object.assign(new Error(`You can save up to ${MAX_PETS_PER_CUSTOMER} pets.`), { statusCode: 409 })
  }
  return mapPet(pet)
}

export async function updateCustomerPet(userId, id, input) {
  requireOwner(userId)
  validatePetId(id)
  const data = validatePetInput(input, { update: true })
  return mapPet(requirePet(await updateCustomerPetById(userId, id, data)))
}

export async function archiveCustomerPet(userId, id, input) {
  requireOwner(userId)
  validatePetId(id)
  const archived = validatePetArchiveInput(input)
  return mapPet(requirePet(await archiveCustomerPetById(userId, id, archived)))
}

export async function uploadCustomerPetPhoto(userId, id, bytes, type) {
  requireOwner(userId)
  validatePetId(id)
  requirePet(await findCustomerPetById(userId, id))
  const photo = await normalizePetPhoto(bytes, type)
  return mapPet(requirePet(await changeCustomerPetPhoto(userId, id, photo)))
}

export async function getCustomerPetPhoto(userId, id, input) {
  requireOwner(userId)
  validatePetId(id)
  validateEmptyPetInput(input)
  const pet = requirePet(await findCustomerPetPhoto(userId, id))
  if (!pet.photo) throw Object.assign(new Error('Pet photo not found.'), { statusCode: 404 })
  return { bytes: Buffer.from(pet.photo.bytes), contentType: 'image/webp' }
}

export async function deleteCustomerPetPhoto(userId, id, input) {
  requireOwner(userId)
  validatePetId(id)
  validateEmptyPetInput(input)
  return mapPet(requirePet(await changeCustomerPetPhoto(userId, id, null)))
}

export async function deleteCustomerPet(userId, id, input) {
  requireOwner(userId)
  validatePetId(id)
  validateEmptyPetInput(input)
  const pet = requirePet(await deleteCustomerPetById(userId, id))
  return { id: pet.id }
}
