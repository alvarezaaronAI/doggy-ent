import { prisma } from '../../../db/prisma.js'
import { MAX_PETS_PER_CUSTOMER } from '../constants/pets.constants.js'
import { PET_SELECT } from '../mappers/pets.mapper.js'
import { changedPetFields, mapPetActivity } from '../mappers/petsActivity.mapper.js'

async function petTransaction(action) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(action, { isolationLevel: 'Serializable' })
    }
    catch (error) {
      if (error.code !== 'P2034' || attempt === 2) throw error
    }
  }
}

async function ownedMutation(action) {
  try { return await action() }
  catch (error) {
    if (error.code === 'P2025') return null
    throw error
  }
}

export function findCustomerPets(userId) {
  return prisma.pet.findMany({
    where: { userId },
    select: PET_SELECT,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: MAX_PETS_PER_CUSTOMER,
  })
}

export function findCustomerPetById(userId, id) {
  return prisma.pet.findUnique({ where: { id, userId }, select: PET_SELECT })
}

export function findCustomerPetPhoto(userId, id) {
  return prisma.pet.findUnique({
    where: { id, userId },
    select: { photo: { select: { bytes: true, contentType: true } } },
  })
}

export async function createCustomerPetWithinLimit(userId, data) {
  // The cap, mutation and minimal history commit together, including on retries.
  return petTransaction(async tx => {
    const count = await tx.pet.count({ where: { userId } })
    if (count >= MAX_PETS_PER_CUSTOMER) return null
    const pet = await tx.pet.create({
      data: { ...data, userId, ...(data.birthdayMonth != null ? { birthdaySetAt: new Date() } : {}), ...(data.weightGrams != null ? { weightUpdatedAt: new Date() } : {}) },
      select: PET_SELECT,
    })
    await tx.customerAccountEvent.create({ data: mapPetActivity({ userId, type: 'PET_CREATED', pet }) })
    return pet
  })
}

export async function updateCustomerPetById(userId, id, data) {
  return petTransaction(async tx => {
    const current = await tx.pet.findUnique({ where: { id, userId }, select: PET_SELECT })
    if (!current) return null
    // Read and check the birthday inside every transaction/retry, never before it.
    if (Object.hasOwn(data, 'birthdayMonth') && (current.birthdaySetAt || current.birthdayMonth != null)
      && (data.birthdayMonth !== current.birthdayMonth || data.birthdayDay !== current.birthdayDay)) {
      throw Object.assign(new Error('A saved birthday cannot be changed.'), { statusCode: 409 })
    }
    const changedFields = changedPetFields(current, data)
    if (!changedFields.length) return current
    const birthday = data.birthdayMonth != null && current.birthdayMonth == null
      ? { birthdaySetAt: new Date() } : {}
    const weight = Object.hasOwn(data, 'weightGrams') && data.weightGrams !== (current.weightGrams ?? null)
      ? { weightUpdatedAt: data.weightGrams === null ? null : new Date() } : {}
    const pet = await ownedMutation(() => tx.pet.update({ where: { id, userId }, data: { ...data, ...birthday, ...weight }, select: PET_SELECT }))
    if (!pet) return null
    await tx.customerAccountEvent.create({ data: mapPetActivity({ userId, type: 'PET_UPDATED', pet, changedFields }) })
    return pet
  })
}

export async function archiveCustomerPetById(userId, id, archived) {
  return petTransaction(async tx => {
    const current = await tx.pet.findUnique({ where: { id, userId }, select: PET_SELECT })
    if (!current) return null
    if (Boolean(current.archivedAt) === archived) return current
    const pet = await ownedMutation(() => tx.pet.update({
      where: { id, userId }, data: { archivedAt: archived ? new Date() : null }, select: PET_SELECT,
    }))
    if (!pet) return null
    await tx.customerAccountEvent.create({ data: mapPetActivity({
      userId, type: archived ? 'PET_ARCHIVED' : 'PET_RESTORED', pet, changedFields: ['archivedAt'],
    }) })
    return pet
  })
}

export async function changeCustomerPetPhoto(userId, id, photo) {
  return petTransaction(async tx => {
    const current = await tx.pet.findUnique({ where: { id, userId }, select: PET_SELECT })
    if (!current) return null
    if (!photo && !current.photo) return current
    const pet = await ownedMutation(() => tx.pet.update({
      where: { id, userId },
      data: { photo: photo ? { upsert: { create: photo, update: photo } } : { delete: true } },
      select: PET_SELECT,
    }))
    if (!pet) return null
    await tx.customerAccountEvent.create({ data: mapPetActivity({
      userId, type: photo ? 'PET_PHOTO_CHANGED' : 'PET_PHOTO_REMOVED', pet, changedFields: ['photo'],
    }) })
    return pet
  })
}

export async function deleteCustomerPetById(userId, id) {
  return petTransaction(async tx => {
    const pet = await ownedMutation(() => tx.pet.delete({
      where: { id, userId }, select: { id: true, createdAt: true, updatedAt: true },
    }))
    if (!pet) return null
    await tx.customerAccountEvent.create({ data: mapPetActivity({ userId, type: 'PET_DELETED', pet }) })
    return { id: pet.id }
  })
}
