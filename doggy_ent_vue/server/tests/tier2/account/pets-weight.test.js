import { describe, expect, it } from 'vitest'
import { validatePetInput } from '../../../src/domains/pets/validators/pets.validator.js'
import { mapPet } from '../../../src/domains/pets/mappers/pets.mapper.js'
import { changedPetFields, mapPetActivity } from '../../../src/domains/pets/mappers/petsActivity.mapper.js'

describe('pet weight server contract', () => {
  it('defaults new pets to no weight but preserves omitted weight on legacy updates', () => {
    expect(validatePetInput({ nickname: 'Fixture' })).toMatchObject({ weightGrams: null, weightUnit: null })
    const legacy = validatePetInput({ nickname: 'Fixture' }, { update: true })
    expect(legacy).not.toHaveProperty('weightGrams')
    expect(legacy).not.toHaveProperty('weightUnit')
    expect(validatePetInput({ nickname: 'Fixture', weightGrams: null, weightUnit: null }, { update: true })).toMatchObject({ weightGrams: null, weightUnit: null })
  })
  it('accepts valid canonical grams and only returns a server-stamped weight date', () => {
    for (const weightUnit of ['LB', 'KG']) for (const weightGrams of [100, 12500, 250000]) {
      expect(validatePetInput({ nickname: 'Fixture', weightGrams, weightUnit })).toMatchObject({ weightGrams, weightUnit })
    }
    const date = new Date('2026-10-23T00:00:00Z')
    expect(mapPet({ weightGrams: 12500, weightUnit: 'KG', weightUpdatedAt: date })).toMatchObject({ weightGrams: 12500, weightUnit: 'KG', weightUpdatedAt: date.toISOString() })
    expect(mapPet({})).toMatchObject({ weightGrams: null, weightUnit: null, weightUpdatedAt: null })
  })
  it.each([
    { weightGrams: 12500 }, { weightUnit: 'KG' }, { weightGrams: null, weightUnit: 'KG' },
    { weightGrams: 12500, weightUnit: null }, { weightGrams: '12500', weightUnit: 'KG' },
    { weightGrams: 99, weightUnit: 'KG' }, { weightGrams: 250001, weightUnit: 'KG' },
    { weightGrams: 12500.5, weightUnit: 'KG' }, { weightGrams: NaN, weightUnit: 'KG' },
    { weightGrams: Infinity, weightUnit: 'LB' }, { weightGrams: 12500, weightUnit: 'kg' },
    { weightGrams: 12500, weightUnit: 'G' }, { weightUpdatedAt: null },
  ])('rejects unsafe, partial or server-owned weight input: %j', input => {
    expect(() => validatePetInput({ nickname: 'Fixture', ...input })).toThrow(expect.objectContaining({ statusCode: 400 }))
  })
  it('records only changed field names, never weight measurements', () => {
    const fields = changedPetFields({ weightGrams: 12500, weightUnit: 'LB' }, { weightGrams: 13000, weightUnit: 'KG' })
    expect(fields).toEqual(['weightGrams', 'weightUnit'])
    const activity = mapPetActivity({ userId: 'fixture', type: 'PET_UPDATED', pet: { id: 'fixture', createdAt: new Date(), updatedAt: new Date(), weightGrams: 13000, weightUnit: 'KG' }, changedFields: fields })
    expect(activity.metadata.changedFields).toEqual(fields)
    expect(activity.metadata).not.toHaveProperty('weightGrams')
    expect(activity.metadata).not.toHaveProperty('weightUnit')
    expect(JSON.stringify(activity)).not.toContain('13000')
  })
})
