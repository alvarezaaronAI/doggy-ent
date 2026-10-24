import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { toPetProfileForm, toPetProfilePayload } from '../../../src/domains/account/mappers/petProfile.mapper.js'
import { validatePetForm } from '../../../src/domains/account/validators/petProfile.validator.js'
import { parsePetWeight, petWeightInput, petWeightLabel } from '../../../src/domains/account/constants/petWeight.generated.js'

describe('optional pet weight', () => {
  it('keeps all three deployed copies aligned with the canonical shared rules', () => {
    const canonical = readFileSync(new URL('../../../../shared/pets/petWeight.js', import.meta.url), 'utf8')
    for (const path of ['../../../src/domains/account/constants/petWeight.generated.js', '../../../../server/src/domains/pets/constants/petWeight.generated.js']) {
      expect(readFileSync(new URL(path, import.meta.url), 'utf8').endsWith(canonical)).toBe(true)
    }
  })
  it('accepts blank, decimals and decimal commas, and normalizes pounds/kilograms to grams', () => {
    expect(parsePetWeight('', 'LB')).toBeNull()
    expect(parsePetWeight('28', 'LB')).toBe(12701)
    expect(parsePetWeight('12,5', 'KG')).toBe(12500)
    expect(petWeightLabel(12500, 'KG')).toBe('12.5 kg')
    expect(petWeightLabel(12701, 'LB')).toBe('28 lb')
    expect(petWeightLabel(null)).toBe('')
  })
  it.each(['0', '-1', 'Infinity', 'NaN', '1e2', '12.345', 'one', '250.01', '0.09'])('rejects malformed or out-of-range kg: %s', value => {
    const form = { ...toPetProfileForm({ nickname: 'Fixture' }), weight: value, weightUnit: 'KG' }
    expect(validatePetForm(form).weight).toBeTruthy()
    expect(() => toPetProfilePayload(form)).toThrow('Check your pet weight.')
  })
  it('preserves exact stored grams after rendering or switching units repeatedly, including boundaries', () => {
    for (const grams of [100, 101, 12500, 12701, 30001, 250000]) {
      const form = toPetProfileForm({ nickname: 'Fixture', weightGrams: grams, weightUnit: 'LB', sizeBand: 'MEDIUM' })
      for (const unit of ['LB', 'KG', 'LB', 'KG']) {
        form.weightUnit = unit; form.weight = petWeightInput(grams, unit)
        expect(toPetProfilePayload(form)).toMatchObject({ weightGrams: grams, weightUnit: unit, sizeBand: 'MEDIUM' })
        expect(validatePetForm(form).weight).toBeUndefined()
      }
    }
  })
  it('converts an edited value, explicitly clears blank input, and never submits server dates or form metadata', () => {
    const form = toPetProfileForm({ nickname: 'Fixture', weightGrams: 12500, weightUnit: 'KG', weightUpdatedAt: 'private' })
    form.weight = '13'
    expect(toPetProfilePayload(form)).toMatchObject({ weightGrams: 13000, weightUnit: 'KG' })
    form.weight = ''
    const payload = toPetProfilePayload(form)
    expect(payload).toMatchObject({ weightGrams: null, weightUnit: null })
    for (const key of ['weight', 'weightOriginalGrams', 'weightUpdatedAt']) expect(payload).not.toHaveProperty(key)
    expect(validatePetForm(form).weight).toBeUndefined()
  })
})
