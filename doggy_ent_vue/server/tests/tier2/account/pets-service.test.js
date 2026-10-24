import { beforeEach, describe, expect, it, vi } from 'vitest'

const repository = vi.hoisted(() => ({
  findCustomerPets: vi.fn(), createCustomerPetWithinLimit: vi.fn(),
  updateCustomerPetById: vi.fn(), deleteCustomerPetById: vi.fn(),
  archiveCustomerPetById: vi.fn(), changeCustomerPetPhoto: vi.fn(),
  findCustomerPetById: vi.fn(), findCustomerPetPhoto: vi.fn(),
}))
vi.mock('../../../src/domains/pets/repositories/pets.repository.js', () => repository)
const {
  createCustomerPet, deleteCustomerPet, getCustomerPets, updateCustomerPet,
} = await import('../../../src/domains/pets/services/pets.service.js')

const id = 'c' + 'a'.repeat(24)
const owner = 'customer-one'
const pet = { id, nickname: 'Chase', userId: owner, user: { password: 'private-fixture' } }

beforeEach(() => {
  vi.resetAllMocks()
  repository.findCustomerPets.mockResolvedValue([pet])
  repository.createCustomerPetWithinLimit.mockResolvedValue(pet)
  repository.updateCustomerPetById.mockResolvedValue(pet)
  repository.deleteCustomerPetById.mockResolvedValue(pet)
})

describe('customer pet service', () => {
  it('scopes every operation to the supplied authenticated identity and sanitizes results', async () => {
    const listed = await getCustomerPets(owner)
    const created = await createCustomerPet(owner, { nickname: ' Chase ' })
    const updated = await updateCustomerPet(owner, id, { nickname: ' Chase ', lifeStage: 'ADULT' })
    const deleted = await deleteCustomerPet(owner, id)
    expect(repository.findCustomerPets).toHaveBeenCalledWith(owner)
    expect(repository.createCustomerPetWithinLimit).toHaveBeenCalledWith(owner, {
      nickname: 'Chase', lifeStage: null, sizeBand: null, proteinPreferences: [], treatPurpose: null,
      breedId: null, isMixed: false, birthdayMonth: null, birthdayDay: null, treatPurposes: [], weightGrams: null, weightUnit: null,
    })
    expect(repository.updateCustomerPetById).toHaveBeenCalledWith(owner, id, {
      nickname: 'Chase', lifeStage: 'ADULT', sizeBand: null, proteinPreferences: [], treatPurpose: null,
    })
    expect(repository.deleteCustomerPetById).toHaveBeenCalledWith(owner, id)
    expect(deleted).toEqual({ id })
    for (const result of [...listed, created, updated, deleted]) {
      expect(result).not.toHaveProperty('userId')
      expect(result).not.toHaveProperty('user')
    }
  })

  it('returns a real empty state and translates only a confirmed capacity failure to 409', async () => {
    repository.findCustomerPets.mockResolvedValue([])
    expect(await getCustomerPets(owner)).toEqual([])
    repository.createCustomerPetWithinLimit.mockResolvedValue(null)
    await expect(createCustomerPet(owner, { nickname: 'Chase' })).rejects.toMatchObject({
      statusCode: 409, message: 'You can save up to 10 pets.',
    })
    const failure = new Error('database unavailable')
    repository.createCustomerPetWithinLimit.mockRejectedValue(failure)
    await expect(createCustomerPet(owner, { nickname: 'Chase' })).rejects.toBe(failure)
  })

  it.each([undefined, null, '', ' ', {}, 123])('fails closed without an authenticated owner: %j', async value => {
    for (const action of [
      () => getCustomerPets(value),
      () => createCustomerPet(value, { nickname: 'Chase' }),
      () => updateCustomerPet(value, id, { nickname: 'Chase' }),
      () => deleteCustomerPet(value, id),
    ]) await expect(action()).rejects.toMatchObject({ statusCode: 401 })
    for (const method of Object.values(repository)) expect(method).not.toHaveBeenCalled()
  })

  it('validates create/update/delete before any persistence on malformed input or owner injection', async () => {
    for (const input of [null, {}, { nickname: 'Chase', userId: 'other' }, { nickname: 'Chase', id }, { nickname: 'Chase', proteinPreferences: ['BEEF', 'BEEF'] }]) {
      await expect(createCustomerPet(owner, input)).rejects.toMatchObject({ statusCode: 400 })
      await expect(updateCustomerPet(owner, id, input)).rejects.toMatchObject({ statusCode: 400 })
    }
    await expect(deleteCustomerPet(owner, id, { userId: 'other' })).rejects.toMatchObject({ statusCode: 400 })
    await expect(updateCustomerPet(owner, 'malformed', { nickname: 'Chase' })).rejects.toMatchObject({ statusCode: 404 })
    await expect(deleteCustomerPet(owner, 'malformed')).rejects.toMatchObject({ statusCode: 404 })
    for (const method of Object.values(repository)) expect(method).not.toHaveBeenCalled()
  })

  it('uses the same not-found response for absent and foreign-owned mutations', async () => {
    repository.updateCustomerPetById.mockResolvedValue(null)
    repository.deleteCustomerPetById.mockResolvedValue(null)
    for (const userId of [owner, 'another-customer']) {
      await expect(updateCustomerPet(userId, id, { nickname: 'Evie' })).rejects.toMatchObject({ statusCode: 404, message: 'Pet not found.' })
      await expect(deleteCustomerPet(userId, id)).rejects.toMatchObject({ statusCode: 404, message: 'Pet not found.' })
    }
  })
})
