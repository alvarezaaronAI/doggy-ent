import { describe, expect, it } from 'vitest'
import { changedPetFields, mapPetActivity } from '../../../src/domains/pets/mappers/petsActivity.mapper.js'

const pet = Object.freeze({
  id: 'pet-one', nickname: 'Private pet name', lifeStage: 'ADULT', sizeBand: 'LARGE',
  proteinPreferences: Object.freeze(['BEEF', 'DUCK']), treatPurpose: 'TRAINING',
  createdAt: new Date('2026-10-01T12:00:00.000Z'), updatedAt: new Date('2026-10-02T12:00:00.000Z'),
  photo: 'private-photo', birthday: 'private-date', token: 'private-secret',
})
const occurredAt = new Date('2026-10-03T12:00:00.000Z')

describe('minimal pet activity facts', () => {
  it.each(['PET_CREATED', 'PET_UPDATED', 'PET_DELETED'])('maps %s with server identity/time and original tenure, not a pet snapshot', type => {
    const result = mapPetActivity({ userId: 'owner', type, pet, occurredAt, changedFields: ['nickname', 'token'] })
    expect(result).toMatchObject({
      userId: 'owner', type, changedByType: 'CUSTOMER', changedBy: 'owner', createdAt: occurredAt,
      metadata: { schemaVersion: 1, petId: 'pet-one', petCreatedAt: pet.createdAt.toISOString(), petUpdatedAt: pet.updatedAt.toISOString(), profileAgeSeconds: 172800, changedFields: ['nickname'] },
    })
    expect(Object.keys(result.metadata).sort()).toEqual(['changedFields', 'petCreatedAt', 'petId', 'petUpdatedAt', 'profileAgeSeconds', 'schemaVersion'])
    const serialized = JSON.stringify(result)
    for (const value of ['Private pet name', 'BEEF', 'DUCK', 'private-photo', 'private-date', 'private-secret']) {
      expect(serialized).not.toContain(value)
    }
    for (const key of ['fraud', 'riskScore', 'ipAddress', 'userAgent', 'session', 'password']) expect(result.metadata).not.toHaveProperty(key)
  })

  it('records only changed allowlisted field names and treats protein order as immaterial', () => {
    expect(changedPetFields(pet, { ...pet, proteinPreferences: ['DUCK', 'BEEF'], token: 'different' })).toEqual([])
    expect(changedPetFields(pet, { ...pet, nickname: 'Changed', lifeStage: 'SENIOR', proteinPreferences: ['CHICKEN'] })).toEqual(['nickname', 'lifeStage', 'proteinPreferences'])
    expect(pet.proteinPreferences).toEqual(['BEEF', 'DUCK'])
  })

  it('clamps server clock skew to zero duration and rejects unsupported event types or invalid dates', () => {
    expect(mapPetActivity({ userId: 'owner', type: 'PET_CREATED', pet, occurredAt: new Date('2026-09-30T12:00:00.000Z') }).metadata.profileAgeSeconds).toBe(0)
    expect(() => mapPetActivity({ userId: 'owner', type: 'constructor', pet, occurredAt })).toThrow('Unsupported pet activity.')
    expect(() => mapPetActivity({ userId: 'owner', type: 'PET_DELETED', pet: { ...pet, createdAt: 'invalid' }, occurredAt })).toThrow()
  })
})
