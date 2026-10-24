import { describe, expect, it } from 'vitest'
import {
  PET_LIFE_STAGES,
  PET_PROTEIN_PREFERENCES,
  PET_SIZE_BANDS,
  PET_TREAT_PURPOSES,
} from '../../../src/domains/pets/constants/pets.constants.js'
import { mapPet, PET_SELECT } from '../../../src/domains/pets/mappers/pets.mapper.js'
import {
  validateEmptyPetInput,
  validatePetId,
  validatePetInput,
  validatePetArchiveInput,
} from '../../../src/domains/pets/validators/pets.validator.js'

describe('strict optional pet profile validation', () => {
  it('requires only a trimmed nickname and defaults all optional choices', () => {
    expect(validatePetInput({ nickname: '  Chase  ' })).toEqual({
      nickname: 'Chase', lifeStage: null, sizeBand: null,
      proteinPreferences: [], treatPurpose: null,
      breedId: null, isMixed: false, birthdayMonth: null, birthdayDay: null, treatPurposes: [], weightGrams: null, weightUnit: null,
    })
    expect(validatePetInput({ nickname: 'x'.repeat(60) }).nickname).toHaveLength(60)
  })

  it('accepts every declared option and explicit clearing without mutating inputs', () => {
    for (const [field, values] of Object.entries({
      lifeStage: PET_LIFE_STAGES, sizeBand: PET_SIZE_BANDS,
      treatPurpose: PET_TREAT_PURPOSES,
    })) {
      for (const value of values) {
        expect(validatePetInput({ nickname: 'Evie', [field]: value })[field]).toBe(value)
      }
      expect(validatePetInput({ nickname: 'Evie', [field]: null })[field]).toBeNull()
    }
    const input = Object.freeze({ nickname: ' Evie ', proteinPreferences: PET_PROTEIN_PREFERENCES })
    const result = validatePetInput(input)
    expect(result.proteinPreferences).toEqual(PET_PROTEIN_PREFERENCES)
    expect(result.proteinPreferences).not.toBe(input.proteinPreferences)
    expect(input.nickname).toBe(' Evie ')
  })

  it.each([
    undefined, null, [], 'Chase', 3, true, {},
    { nickname: null }, { nickname: 42 }, { nickname: {} },
    { nickname: '' }, { nickname: ' \n\t ' }, { nickname: 'x'.repeat(61) },
    { nickname: 'Chase', lifeStage: 'adult' },
    { nickname: 'Chase', lifeStage: [] },
    { nickname: 'Chase', sizeBand: 'XL' },
    { nickname: 'Chase', sizeBand: true },
    { nickname: 'Chase', treatPurpose: 'MEDICAL' },
    { nickname: 'Chase', treatPurpose: {} },
    { nickname: 'Chase', proteinPreferences: null },
    { nickname: 'Chase', proteinPreferences: 'CHICKEN' },
    { nickname: 'Chase', proteinPreferences: [null] },
    { nickname: 'Chase', proteinPreferences: ['chicken'] },
    { nickname: 'Chase', proteinPreferences: ['VENISON'] },
    { nickname: 'Chase', proteinPreferences: ['BEEF', 'BEEF'] },
    { nickname: 'Chase', proteinPreferences: Array(7).fill('BEEF') },
    { nickname: 'Chase', proteinPreferences: [{}] },
    { nickname: 'Chase', id: 'supplied-id' },
    { nickname: 'Chase', userId: 'another-customer' },
    { nickname: 'Chase', user: { connect: { id: 'another-customer' } } },
    { nickname: 'Chase', createdAt: '2026-10-20' },
    { nickname: 'Chase', marketingOptIn: true },
    { nickname: 'Chase', medicalNotes: 'not collected' },
    { nickname: 'Chase', unexpected: true },
    JSON.parse('{"nickname":"Chase","__proto__":{"userId":"other"}}'),
    Object.create({ nickname: 'Inherited' }),
  ])('rejects malformed or undeclared fields: %j', input => {
    expect(() => validatePetInput(input)).toThrow(expect.objectContaining({ statusCode: 400 }))
  })

  it('rejects nonempty query/delete inputs and invalid IDs without reflecting input', () => {
    for (const input of [undefined, {}]) expect(() => validateEmptyPetInput(input)).not.toThrow()
    for (const input of [null, [], { userId: 'other' }, { id: 'other' }, { unknown: true }]) {
      expect(() => validateEmptyPetInput(input)).toThrow(expect.objectContaining({ statusCode: 400 }))
    }
    const id = 'c' + 'a'.repeat(24)
    expect(validatePetId(id)).toBe(id)
    for (const input of [undefined, null, '', 'missing', {}, 'c' + 'a'.repeat(25)]) {
      expect(() => validatePetId(input)).toThrow(expect.objectContaining({ statusCode: 404, message: 'Pet not found.' }))
    }
  })
})

describe('pet response allowlist', () => {
  it('omits owner/auth/private fields even if a repository returns extra data', () => {
    const pet = {
      id: 'c' + 'a'.repeat(24), nickname: 'Chase', proteinPreferences: ['BEEF'],
      createdAt: new Date('2026-10-20T00:00:00Z'), updatedAt: new Date('2026-10-20T00:00:00Z'),
      userId: 'owner', user: { accounts: [{ password: 'fixture-private' }] },
      sessions: [{ token: 'fixture-private' }], notes: 'internal',
    }
    const mapped = mapPet(pet)
    expect(Object.keys(mapped).sort()).toEqual([...Object.keys(PET_SELECT).filter(key => key !== 'photo'), 'hasPhoto', 'photoUpdatedAt'].sort())
    expect(mapped).toMatchObject({ lifeStage: null, sizeBand: null, treatPurpose: null })
    expect(JSON.stringify(mapped)).not.toMatch(/owner|fixture-private|internal|userId|sessions/)
    mapped.proteinPreferences.push('DUCK')
    expect(pet.proteinPreferences).toEqual(['BEEF'])
    expect(PET_SELECT).not.toHaveProperty('userId')
    expect(PET_SELECT).not.toHaveProperty('user')
  })
})

describe('photo-led optional fields', () => {
  it('keeps all new fields absent on a legacy update and maps the legacy scalar only when the array is absent', () => {
    const data = validatePetInput({ nickname: 'Chase', treatPurpose: 'EVERYDAY' }, { update: true })
    for (const field of ['breedId', 'isMixed', 'birthdayMonth', 'birthdayDay', 'treatPurposes']) expect(data).not.toHaveProperty(field)
    expect(mapPet({ treatPurpose: 'EVERYDAY' }).treatPurposes).toEqual(['EVERYDAY'])
    expect(mapPet({ treatPurpose: 'EVERYDAY', treatPurposes: [] }).treatPurposes).toEqual([])
    expect(validatePetInput({ nickname: 'Chase', treatPurpose: 'EVERYDAY' }).treatPurposes).toEqual(['EVERYDAY'])
    expect(validatePetInput({ nickname: 'Chase', treatPurposes: ['BONDING'] }, { update: true })).not.toHaveProperty('treatPurpose')
  })

  it('accepts all valid month/day boundaries including leap day, without a year', () => {
    for (let month = 1; month <= 12; month++) {
      const max = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
      for (const day of [1, max]) expect(validatePetInput({ nickname: 'Chase', birthdayMonth: month, birthdayDay: day })).toMatchObject({ birthdayMonth: month, birthdayDay: day })
      expect(() => validatePetInput({ nickname: 'Chase', birthdayMonth: month, birthdayDay: max + 1 })).toThrow()
    }
    expect(validatePetInput({ nickname: 'Chase', birthdayMonth: null, birthdayDay: null })).toMatchObject({ birthdayMonth: null, birthdayDay: null })
  })

  it('accepts independent mix and canonical breed choices, and distinct sets of all five purposes', () => {
    expect(validatePetInput({ nickname: 'Chase', isMixed: true, breedId: 'unknown', treatPurposes: PET_TREAT_PURPOSES })).toMatchObject({
      isMixed: true, breedId: 'unknown', treatPurposes: PET_TREAT_PURPOSES, treatPurpose: 'TRAINING',
    })
    expect(validatePetInput({ nickname: 'Chase', breedId: 'not-listed' }).breedId).toBe('not-listed')
    expect(validatePetArchiveInput({ archived: true })).toBe(true)
    expect(validatePetArchiveInput({ archived: false })).toBe(false)
    for (const input of [undefined, null, {}, [], { archived: 1 }, { archived: true, archivedAt: null }]) {
      expect(() => validatePetArchiveInput(input)).toThrow(expect.objectContaining({ statusCode: 400 }))
    }
  })

  it.each([
    { birthdayMonth: 2 }, { birthdayDay: 2 }, { birthdayMonth: 2, birthdayDay: null },
    { birthdayMonth: '2', birthdayDay: 29 }, { birthdayMonth: 2, birthdayDay: 1.5 },
    { birthdayMonth: 0, birthdayDay: 1 }, { birthdayMonth: 13, birthdayDay: 1 },
    { birthdayMonth: 2, birthdayDay: 0 }, { birthdayMonth: 4, birthdayDay: 31 },
    { breedId: 'Lab' }, { breedId: '' }, { breedId: {} }, { breedId: 'x'.repeat(65) },
    { isMixed: null }, { isMixed: 'true' }, { treatPurposes: null },
    { treatPurposes: ['TRAINING', 'TRAINING'] }, { treatPurposes: ['PLAY'] },
    { treatPurposes: Array(6).fill('BONDING') },
    { birthdaySetAt: null }, { archivedAt: null }, { photoUpdatedAt: null },
    { hasPhoto: true }, { photo: {} }, { birthdayYear: 2020 }, { petId: 'other' },
  ])('rejects invalid new fields and server-owned input: %j', fields => {
    expect(() => validatePetInput({ nickname: 'Chase', ...fields })).toThrow(expect.objectContaining({ statusCode: 400 }))
  })

  it('projects only photo presence/date, never image bytes or metadata', () => {
    const date = new Date('2026-10-23T00:00:00Z')
    const mapped = mapPet({ photo: { updatedAt: date, bytes: Buffer.from('private-canary'), contentType: 'private-type' }, birthdaySetAt: date, archivedAt: date })
    expect(mapped).toMatchObject({ hasPhoto: true, photoUpdatedAt: date.toISOString(), birthdaySetAt: date.toISOString(), archivedAt: date.toISOString() })
    expect(JSON.stringify(mapped)).not.toMatch(/canary|bytes|contentType/)
    expect(PET_SELECT.photo).toEqual({ select: { updatedAt: true } })
  })
})
