import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PET_BREEDS, findPetBreed } from '../../../../shared/pets/petCatalog.js'
import { PET_BREEDS as serverBreeds } from '../../../src/domains/pets/constants/petCatalog.generated.js'
import { validatePetInput } from '../../../src/domains/pets/validators/pets.validator.js'

describe('canonical pet breed catalogue', () => {
  it('contains the approved 58 named choices and two stable fallbacks, deeply immutable', () => {
    expect(PET_BREEDS).toHaveLength(60)
    expect(new Set(PET_BREEDS.map(breed => breed.value)).size).toBe(60)
    expect(PET_BREEDS.slice(-2).map(breed => breed.value)).toEqual(['unknown', 'not-listed'])
    expect(Object.isFrozen(PET_BREEDS)).toBe(true)
    for (const breed of PET_BREEDS) {
      expect(Object.isFrozen(breed)).toBe(true)
      expect(Object.isFrozen(breed.aliases)).toBe(true)
      expect(Object.keys(breed).sort()).toEqual(['aliases', 'label', 'value'])
      expect(validatePetInput({ nickname: 'Pet', breedId: breed.value }).breedId).toBe(breed.value)
    }
    expect(findPetBreed('labrador-retriever').aliases).toContain('lab')
    expect(findPetBreed('lab')).toBeNull()
    expect(serverBreeds).toEqual(PET_BREEDS)
  })

  it('keeps both deployment copies byte-identical to the canonical module', () => {
    const canonical = readFileSync(new URL('../../../../shared/pets/petCatalog.js', import.meta.url), 'utf8')
    for (const relative of [
      '../../../src/domains/pets/constants/petCatalog.generated.js',
      '../../../../client/src/domains/account/constants/petCatalog.generated.js',
    ]) {
      expect(readFileSync(new URL(relative, import.meta.url), 'utf8')).toBe('// Generated from shared/pets/petCatalog.js. Do not edit directly.\n' + canonical)
    }
  })

  it('keeps migration additive, backfills the array and bounds birthday/photo storage', () => {
    const sql = readFileSync(new URL('../../../prisma/migrations/20261023000000_photo_led_pet_profiles/migration.sql', import.meta.url), 'utf8')
    expect(sql).not.toMatch(/DROP|TRUNCATE|DELETE FROM|ALTER COLUMN/i)
    expect(sql).toContain("ADD VALUE 'BONDING' BEFORE 'EVERYDAY'")
    expect(sql).toContain('SET "treatPurposes" = ARRAY["treatPurpose"]')
    expect(sql).toContain('cardinality("treatPurposes") <= 5')
    expect(sql).toContain('"birthdaySetAt" IS NOT NULL')
    expect(sql).toContain('WHEN 2 THEN 29')
    expect(sql).toContain('octet_length("bytes") BETWEEN 1 AND 1048576')
    expect(sql).toContain('PRIMARY KEY ("petId")')
    expect(sql).toContain('REFERENCES "public"."Pet"("id") ON DELETE CASCADE')
  })
})
