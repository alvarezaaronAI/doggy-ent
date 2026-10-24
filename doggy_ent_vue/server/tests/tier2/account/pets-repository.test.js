import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pet = vi.hoisted(() => ({
  findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
}))
const customerAccountEvent = vi.hoisted(() => ({ create: vi.fn() }))
const rootPet = vi.hoisted(() => ({
  findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
}))
const rootEvent = vi.hoisted(() => ({ create: vi.fn() }))
const transaction = vi.hoisted(() => vi.fn())
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { pet: rootPet, customerAccountEvent: rootEvent, $transaction: transaction } }))
const {
  createCustomerPetWithinLimit, deleteCustomerPetById, findCustomerPets, updateCustomerPetById,
  archiveCustomerPetById, changeCustomerPetPhoto, findCustomerPetById, findCustomerPetPhoto,
} = await import('../../../src/domains/pets/repositories/pets.repository.js')
const { PET_SELECT } = await import('../../../src/domains/pets/mappers/pets.mapper.js')

const owner = 'customer-one'
const id = 'c' + 'a'.repeat(24)
const data = { nickname: 'Chase', lifeStage: null, sizeBand: null, proteinPreferences: [], treatPurpose: null }
const addedAt = new Date('2026-10-01T10:00:00.000Z')
const updatedAt = new Date('2026-10-02T10:00:00.000Z')
const savedPet = { id, ...data, createdAt: addedAt, updatedAt }
const editedData = { ...data, nickname: 'Evie' }

beforeEach(() => {
  vi.resetAllMocks()
  transaction.mockImplementation(action => action({ pet, customerAccountEvent }))
  pet.count.mockResolvedValue(9)
  pet.findUnique.mockResolvedValue(savedPet)
  pet.create.mockResolvedValue(savedPet)
  pet.update.mockResolvedValue({ ...savedPet, ...editedData })
  pet.delete.mockResolvedValue({ id, createdAt: addedAt, updatedAt })
  customerAccountEvent.create.mockResolvedValue({ id: 'activity' })
})

describe('transactional photo-led pet persistence', () => {
  it('stamps actual weight changes but preserves the measurement date for unit-only edits and omitted weight', async () => {
    await createCustomerPetWithinLimit(owner, { ...data, weightGrams: 12500, weightUnit: 'KG' })
    expect(pet.create.mock.calls[0][0].data.weightUpdatedAt).toBeInstanceOf(Date)
    const withWeight = { ...savedPet, weightGrams: 12500, weightUnit: 'KG', weightUpdatedAt: addedAt }
    pet.findUnique.mockResolvedValue(withWeight)
    await updateCustomerPetById(owner, id, { ...data, weightGrams: 13000, weightUnit: 'KG' })
    expect(pet.update.mock.calls[0][0].data.weightUpdatedAt).toBeInstanceOf(Date)
    pet.update.mockClear()
    await updateCustomerPetById(owner, id, { ...data, weightGrams: 12500, weightUnit: 'LB' })
    expect(pet.update.mock.calls[0][0].data).not.toHaveProperty('weightUpdatedAt')
    pet.update.mockClear()
    await updateCustomerPetById(owner, id, data)
    expect(pet.update).not.toHaveBeenCalled()
    await updateCustomerPetById(owner, id, { ...data, weightGrams: null, weightUnit: null })
    expect(pet.update.mock.calls[0][0].data).toMatchObject({ weightGrams: null, weightUnit: null, weightUpdatedAt: null })
  })
  it('reads owned photo metadata without bytes and reads bytes only through the owned resource query', async () => {
    await findCustomerPetById(owner, id)
    await findCustomerPetPhoto(owner, id)
    expect(rootPet.findUnique).toHaveBeenNthCalledWith(1, { where: { id, userId: owner }, select: PET_SELECT })
    expect(rootPet.findUnique).toHaveBeenNthCalledWith(2, { where: { id, userId: owner }, select: { photo: { select: { bytes: true, contentType: true } } } })
    rootPet.findUnique.mockClear()
  })

  it('preserves omitted new fields and records only names when a field is changed', async () => {
    const richer = { ...savedPet, breedId: 'chihuahua', isMixed: true, birthdayMonth: 2, birthdayDay: 29, birthdaySetAt: addedAt, archivedAt: updatedAt, treatPurposes: ['BONDING', 'EVERYDAY'] }
    pet.findUnique.mockResolvedValue(richer)
    expect(await updateCustomerPetById(owner, id, data)).toEqual(richer)
    expect(pet.update).not.toHaveBeenCalled()
    expect(customerAccountEvent.create).not.toHaveBeenCalled()
    await updateCustomerPetById(owner, id, { ...data, breedId: 'unknown', treatPurposes: ['REWARD'] })
    expect(pet.update.mock.calls[0][0].data).toEqual({ ...data, breedId: 'unknown', treatPurposes: ['REWARD'] })
    expect(customerAccountEvent.create.mock.calls[0][0].data.metadata.changedFields).toEqual(['breedId', 'treatPurposes'])
  })

  it('sets birthdaySetAt on the server and locks changes/clears transactionally but permits the same day', async () => {
    const input = { ...data, birthdayMonth: 2, birthdayDay: 29 }
    await createCustomerPetWithinLimit(owner, input)
    expect(pet.create.mock.calls[0][0].data).toMatchObject({ birthdayMonth: 2, birthdayDay: 29, birthdaySetAt: expect.any(Date) })
    await updateCustomerPetById(owner, id, input)
    expect(pet.update.mock.calls[0][0].data.birthdaySetAt).toBeInstanceOf(Date)
    pet.findUnique.mockResolvedValue({ ...savedPet, birthdayMonth: 2, birthdayDay: 29, birthdaySetAt: addedAt })
    pet.update.mockClear(); customerAccountEvent.create.mockClear()
    await updateCustomerPetById(owner, id, input)
    expect(pet.update).not.toHaveBeenCalled()
    for (const pair of [{ birthdayMonth: null, birthdayDay: null }, { birthdayMonth: 3, birthdayDay: 1 }]) {
      await expect(updateCustomerPetById(owner, id, { ...data, ...pair })).rejects.toMatchObject({ statusCode: 409, message: 'A saved birthday cannot be changed.' })
    }
    expect(customerAccountEvent.create).not.toHaveBeenCalled()
  })

  it('rechecks the birthday lock after a competing first save wins', async () => {
    transaction.mockImplementationOnce(async action => { await action({ pet, customerAccountEvent }); throw { code: 'P2034' } })
    pet.findUnique.mockResolvedValueOnce(savedPet).mockResolvedValueOnce({ ...savedPet, birthdayMonth: 1, birthdayDay: 1, birthdaySetAt: addedAt })
    await expect(updateCustomerPetById(owner, id, { ...data, birthdayMonth: 2, birthdayDay: 29 })).rejects.toMatchObject({ statusCode: 409 })
    expect(pet.update).toHaveBeenCalledTimes(1)
    expect(transaction).toHaveBeenCalledTimes(2)
  })

  it('archives/restores with server dates and no redundant events, without deleting or resetting tenure', async () => {
    await archiveCustomerPetById(owner, id, true)
    expect(pet.update.mock.calls[0][0]).toEqual({ where: { id, userId: owner }, data: { archivedAt: expect.any(Date) }, select: PET_SELECT })
    expect(customerAccountEvent.create.mock.calls[0][0].data).toMatchObject({ type: 'PET_ARCHIVED', metadata: { changedFields: ['archivedAt'], petCreatedAt: addedAt.toISOString() } })
    pet.findUnique.mockResolvedValue({ ...savedPet, archivedAt: updatedAt })
    await archiveCustomerPetById(owner, id, true)
    expect(pet.update).toHaveBeenCalledTimes(1)
    await archiveCustomerPetById(owner, id, false)
    expect(pet.update.mock.calls[1][0].data).toEqual({ archivedAt: null })
    expect(customerAccountEvent.create.mock.calls[1][0].data.type).toBe('PET_RESTORED')
    expect(pet.delete).not.toHaveBeenCalled()
  })

  it('upserts/removes private photo bytes via the owned parent and generic transactional audit', async () => {
    const photo = { bytes: Buffer.from('private-pixels'), contentType: 'image/webp' }
    await changeCustomerPetPhoto(owner, id, photo)
    expect(pet.update.mock.calls[0][0]).toEqual({ where: { id, userId: owner }, data: { photo: { upsert: { create: photo, update: photo } } }, select: PET_SELECT })
    pet.findUnique.mockResolvedValue({ ...savedPet, photo: { updatedAt } })
    await changeCustomerPetPhoto(owner, id, null)
    expect(pet.update.mock.calls[1][0].data).toEqual({ photo: { delete: true } })
    expect(customerAccountEvent.create.mock.calls.map(call => call[0].data.type)).toEqual(['PET_PHOTO_CHANGED', 'PET_PHOTO_REMOVED'])
    for (const [event] of customerAccountEvent.create.mock.calls) {
      expect(event.data.metadata.changedFields).toEqual(['photo'])
      expect(JSON.stringify(event)).not.toContain('private-pixels')
    }
  })

  it('does not write for a missing photo removal, foreign owner, or missing pet', async () => {
    await changeCustomerPetPhoto(owner, id, null)
    pet.findUnique.mockResolvedValue(null)
    expect(await archiveCustomerPetById('other', id, true)).toBeNull()
    expect(await changeCustomerPetPhoto('other', id, { bytes: Buffer.from('x'), contentType: 'image/webp' })).toBeNull()
    expect(pet.update).not.toHaveBeenCalled()
    expect(customerAccountEvent.create).not.toHaveBeenCalled()
  })

  it.each(['archive', 'upload', 'remove'])('fails %s atomically if the audit write fails', async action => {
    pet.findUnique.mockResolvedValue({ ...savedPet, photo: { updatedAt } })
    const failure = Object.assign(new Error('audit failure'), { code: 'P2025' })
    customerAccountEvent.create.mockRejectedValue(failure)
    const actions = {
      archive: () => archiveCustomerPetById(owner, id, true),
      upload: () => changeCustomerPetPhoto(owner, id, { bytes: Buffer.from('x'), contentType: 'image/webp' }),
      remove: () => changeCustomerPetPhoto(owner, id, null),
    }
    await expect(actions[action]()).rejects.toBe(failure)
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'Serializable' })
  })

  it.each(['archive', 'upload', 'remove'])('retries %s conflicts with a fresh owned read and no root mutation', async action => {
    pet.findUnique.mockResolvedValue({ ...savedPet, photo: { updatedAt } })
    transaction.mockImplementationOnce(async action => { await action({ pet, customerAccountEvent }); throw { code: 'P2034' } })
    const actions = {
      archive: () => archiveCustomerPetById(owner, id, true),
      upload: () => changeCustomerPetPhoto(owner, id, { bytes: Buffer.from('x'), contentType: 'image/webp' }),
      remove: () => changeCustomerPetPhoto(owner, id, null),
    }
    await actions[action]()
    expect(transaction).toHaveBeenCalledTimes(2)
    expect(pet.findUnique).toHaveBeenCalledTimes(2)
    expect(pet.update).toHaveBeenCalledTimes(2)
    expect(customerAccountEvent.create).toHaveBeenCalledTimes(2)
  })
})

afterEach(() => {
  for (const key of ['findUnique', 'count', 'create', 'update', 'delete']) expect(rootPet[key]).not.toHaveBeenCalled()
  expect(rootEvent.create).not.toHaveBeenCalled()
})

describe('bounded pet persistence', () => {
  it('lists only this owner, with a deterministic ten-row bound and safe selection', async () => {
    rootPet.findMany.mockResolvedValue([])
    expect(await findCustomerPets(owner)).toEqual([])
    expect(rootPet.findMany).toHaveBeenCalledWith({
      where: { userId: owner }, select: PET_SELECT,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 10,
    })
    expect(PET_SELECT).not.toHaveProperty('userId')
  })

  it('checks capacity and inserts in one serializable transaction, overriding any supplied owner', async () => {
    expect(await createCustomerPetWithinLimit(owner, { ...data, userId: 'untrusted' })).toMatchObject({ id })
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'Serializable' })
    expect(pet.count).toHaveBeenCalledWith({ where: { userId: owner } })
    expect(pet.create).toHaveBeenCalledWith({ data: { ...data, userId: owner }, select: PET_SELECT })
    expect(pet.count.mock.invocationCallOrder[0]).toBeLessThan(pet.create.mock.invocationCallOrder[0])
    expect(customerAccountEvent.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      userId: owner, type: 'PET_CREATED', changedBy: owner, changedByType: 'CUSTOMER',
      metadata: expect.objectContaining({ petId: id, petCreatedAt: addedAt.toISOString() }),
    }) })
  })

  it.each([10, 11])('does not write at or beyond the limit: %i', async count => {
    pet.count.mockResolvedValue(count)
    expect(await createCustomerPetWithinLimit(owner, data)).toBeNull()
    expect(pet.create).not.toHaveBeenCalled()
    expect(customerAccountEvent.create).not.toHaveBeenCalled()
  })

  it('rechecks the cap after a losing serializable transaction instead of blindly retrying insertion', async () => {
    transaction.mockImplementationOnce(async action => {
      await action({ pet, customerAccountEvent })
      // Simulate PostgreSQL rolling back the loser after a competing tenth insert.
      throw { code: 'P2034' }
    })
    pet.count.mockResolvedValueOnce(9).mockResolvedValueOnce(10)
    expect(await createCustomerPetWithinLimit(owner, data)).toBeNull()
    expect(transaction).toHaveBeenCalledTimes(2)
    expect(pet.count).toHaveBeenCalledTimes(2)
    expect(pet.create).toHaveBeenCalledTimes(1)
  })

  it('retries only transaction conflicts and stops after three attempts', async () => {
    transaction.mockRejectedValueOnce({ code: 'P2034' }).mockRejectedValueOnce({ code: 'P2034' })
    expect(await createCustomerPetWithinLimit(owner, data)).toMatchObject({ id })
    expect(transaction).toHaveBeenCalledTimes(3)
    transaction.mockClear().mockRejectedValue({ code: 'P2034' })
    await expect(createCustomerPetWithinLimit(owner, data)).rejects.toMatchObject({ code: 'P2034' })
    expect(transaction).toHaveBeenCalledTimes(3)
    transaction.mockClear().mockRejectedValue({ code: 'P2003' })
    await expect(createCustomerPetWithinLimit(owner, data)).rejects.toMatchObject({ code: 'P2003' })
    expect(transaction).toHaveBeenCalledTimes(1)
  })

  it('keeps ownership on every update/delete read/write and records both mutations transactionally', async () => {
    await updateCustomerPetById(owner, id, editedData)
    await deleteCustomerPetById(owner, id)
    expect(pet.findUnique).toHaveBeenCalledWith({ where: { id, userId: owner }, select: PET_SELECT })
    expect(pet.update).toHaveBeenCalledWith({ where: { id, userId: owner }, data: editedData, select: PET_SELECT })
    expect(pet.delete).toHaveBeenCalledWith({ where: { id, userId: owner }, select: { id: true, createdAt: true, updatedAt: true } })
    expect(pet.findMany).not.toHaveBeenCalled()
    expect(transaction).toHaveBeenCalledTimes(2)
    for (const call of transaction.mock.calls) expect(call[1]).toEqual({ isolationLevel: 'Serializable' })
    expect(customerAccountEvent.create.mock.calls.map(call => call[0].data.type)).toEqual(['PET_UPDATED', 'PET_DELETED'])
    expect(customerAccountEvent.create.mock.calls[0][0].data.metadata.changedFields).toEqual(['nickname'])
    expect(customerAccountEvent.create.mock.calls[1][0].data.metadata.petCreatedAt).toBe(addedAt.toISOString())
    expect(customerAccountEvent.create.mock.calls[1][0].data.metadata.profileAgeSeconds).toBeGreaterThan(0)
  })

  it('does not refresh tenure or create history for unchanged fields or reordered protein choices', async () => {
    expect(await updateCustomerPetById(owner, id, data)).toEqual(savedPet)
    pet.findUnique.mockResolvedValue({ ...savedPet, proteinPreferences: ['BEEF', 'DUCK'] })
    await updateCustomerPetById(owner, id, { ...data, proteinPreferences: ['DUCK', 'BEEF'] })
    expect(pet.update).not.toHaveBeenCalled()
    expect(customerAccountEvent.create).not.toHaveBeenCalled()
  })

  it('does not write an update or event for another owner or an absent row', async () => {
    pet.findUnique.mockResolvedValue(null)
    expect(await updateCustomerPetById('other-owner', id, editedData)).toBeNull()
    expect(pet.findUnique).toHaveBeenCalledWith({ where: { id, userId: 'other-owner' }, select: PET_SELECT })
    expect(pet.update).not.toHaveBeenCalled()
    expect(customerAccountEvent.create).not.toHaveBeenCalled()
  })

  it('maps absent/foreign-owned writes to null, but does not hide actual database failures', async () => {
    for (const [method, action] of [
      [pet.update, () => updateCustomerPetById(owner, id, editedData)],
      [pet.delete, () => deleteCustomerPetById(owner, id)],
    ]) {
      method.mockRejectedValueOnce({ code: 'P2025' })
      expect(await action()).toBeNull()
      expect(customerAccountEvent.create).not.toHaveBeenCalled()
      const failure = new Error('database unavailable')
      method.mockRejectedValueOnce(failure)
      await expect(action()).rejects.toBe(failure)
    }
  })

  it.each(['create', 'update', 'delete'])('fails the %s transaction when history cannot be written, without a nontransactional fallback', async method => {
    const failure = Object.assign(new Error('history unavailable'), { code: 'P2025' })
    customerAccountEvent.create.mockRejectedValue(failure)
    const actions = {
      create: () => createCustomerPetWithinLimit(owner, data),
      update: () => updateCustomerPetById(owner, id, editedData),
      delete: () => deleteCustomerPetById(owner, id),
    }
    await expect(actions[method]()).rejects.toBe(failure)
    expect(transaction).toHaveBeenCalledTimes(1)
    expect(customerAccountEvent.create).toHaveBeenCalledTimes(1)
  })

  it.each(['update', 'delete'])('retries a %s conflict after the mutation callback, inside a fresh transaction', async method => {
    transaction.mockImplementationOnce(async action => {
      await action({ pet, customerAccountEvent })
      throw { code: 'P2034' }
    })
    const actions = {
      update: () => updateCustomerPetById(owner, id, editedData),
      delete: () => deleteCustomerPetById(owner, id),
    }
    expect(await actions[method]()).toMatchObject({ id })
    expect(transaction).toHaveBeenCalledTimes(2)
    expect(pet[method]).toHaveBeenCalledTimes(2)
    expect(customerAccountEvent.create).toHaveBeenCalledTimes(2)
    for (const call of transaction.mock.calls) expect(call[1]).toEqual({ isolationLevel: 'Serializable' })
    transaction.mockClear().mockRejectedValue({ code: 'P2034' })
    await expect(actions[method]()).rejects.toMatchObject({ code: 'P2034' })
    expect(transaction).toHaveBeenCalledTimes(3)
  })
})
