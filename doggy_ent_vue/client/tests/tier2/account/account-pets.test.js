import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
const api = vi.hoisted(() => ({ fetchAccountPets: vi.fn(), saveAccountPet: vi.fn(), deleteAccountPet: vi.fn(), archiveAccountPet: vi.fn(), uploadAccountPetPhoto: vi.fn(), deleteAccountPetPhoto: vi.fn() }))
vi.mock('../../../src/domains/account/api/accountPets.api.js', () => api)
import { useAccountPets } from '../../../src/domains/account/composables/useAccountPets.js'
import { toPetProfileForm, toPetProfilePayload } from '../../../src/domains/account/mappers/petProfile.mapper.js'
import { PET_LIFE_STAGES, PET_SIZE_BANDS, PET_PROTEINS, PET_TREAT_PURPOSES, PET_PROFILE_LIMIT } from '../../../src/domains/account/constants/petProfile.constants.js'
import { PET_LIFE_STAGES as serverStages, PET_SIZE_BANDS as serverSizes, PET_PROTEIN_PREFERENCES as serverProteins, PET_TREAT_PURPOSES as serverPurposes, MAX_PETS_PER_CUSTOMER } from '../../../../server/src/domains/pets/constants/pets.constants.js'
function setup() { const scope = effectScope(); return { scope, state: scope.run(useAccountPets) } }
const pet = { id: 'c123456789012345678901234', nickname: 'Fixture Pup', lifeStage: null, sizeBand: null, proteinPreferences: [], treatPurpose: null }
beforeEach(() => vi.resetAllMocks())
describe('optional pet data, separate from identity and marketing', () => {
  it('keeps supported choices aligned with the server contract', () => {
    for (const [client, server] of [[PET_LIFE_STAGES, serverStages], [PET_SIZE_BANDS, serverSizes], [PET_PROTEINS, serverProteins], [PET_TREAT_PURPOSES, serverPurposes]]) expect(client.map(x => x.value)).toEqual([...server])
    expect(PET_PROFILE_LIMIT).toBe(MAX_PETS_PER_CUSTOMER)
  })
  it('clones editing data, removes empty optional choices and never submits ownership/marketing', () => {
    const record = { ...pet, proteinPreferences: ['DUCK'], userId: 'owner', marketingOptIn: true }
    const form = toPetProfileForm(record); form.proteinPreferences.push('BEEF')
    expect(record.proteinPreferences).toEqual(['DUCK'])
    expect(toPetProfilePayload(form)).toEqual({ nickname: 'Fixture Pup', lifeStage: null, sizeBand: null, weightGrams: null, weightUnit: null, proteinPreferences: ['DUCK', 'BEEF'], treatPurposes: [], breedId: null, isMixed: false, birthdayMonth: null, birthdayDay: null })
  })
  it('loads, creates, edits and removes only after explicit confirmation', async () => {
    const { state, scope } = setup()
    api.fetchAccountPets.mockResolvedValue([]); await state.load()
    state.edit(); api.saveAccountPet.mockResolvedValue(pet); await state.save(toPetProfilePayload(toPetProfileForm(pet)))
    expect(state.pets.value).toEqual([pet]); expect(state.editorOpen.value).toBe(false)
    state.edit(pet); api.saveAccountPet.mockResolvedValue({ ...pet, nickname: 'Changed' }); await state.save({ nickname: 'Changed' })
    expect(api.saveAccountPet).toHaveBeenLastCalledWith(pet.id, { nickname: 'Changed' })
    await state.remove(pet); expect(api.deleteAccountPet).not.toHaveBeenCalled()
    state.removing.value = pet.id; await state.remove(pet)
    expect(api.deleteAccountPet).toHaveBeenCalledWith(pet.id); expect(state.pets.value).toEqual([]); scope.stop()
  })
  it('keeps unsaved editor values and the existing list on save failure', async () => {
    const { state, scope } = setup(); state.pets.value = [pet]; state.edit(pet)
    api.saveAccountPet.mockRejectedValue(new Error('private database detail'))
    await state.save({ nickname: 'Changed' })
    expect(state.editorOpen.value).toBe(true); expect(state.pets.value).toEqual([pet]); expect(state.error.value).not.toContain('database'); scope.stop()
  })
  it('does not let a stale list response erase a newly saved pet', async () => {
    const { state, scope } = setup(); let finish
    api.fetchAccountPets.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const pending = state.load(); state.edit(); api.saveAccountPet.mockResolvedValue(pet)
    await state.save({ nickname: pet.nickname }); finish([]); await pending
    expect(state.pets.value).toEqual([pet]); expect(state.loading.value).toBe(false); scope.stop()
  })
  it('preserves a legacy purpose, clones multiple purposes and submits no server-owned fields', () => {
    expect(toPetProfileForm({ ...pet, treatPurpose: 'TRAINING' }).treatPurposes).toEqual(['TRAINING'])
    const record = { ...pet, treatPurposes: ['TRAINING', 'BONDING'], birthdayMonth: 2, birthdayDay: 29, breedId: 'labrador-retriever', isMixed: true, birthdaySetAt: 'private', createdAt: 'private' }
    const form = toPetProfileForm(record); form.treatPurposes.push('REWARD')
    expect(record.treatPurposes).toEqual(['TRAINING', 'BONDING'])
    expect(toPetProfilePayload(form)).not.toHaveProperty('birthdaySetAt')
    expect(toPetProfilePayload(form)).not.toHaveProperty('createdAt')
    expect(toPetProfilePayload(form)).toMatchObject({ birthdayMonth: 2, birthdayDay: 29, isMixed: true, breedId: 'labrador-retriever' })
  })
  it('archives and restores without deleting or creating a replacement profile', async () => {
    const { state, scope } = setup(); state.pets.value = [pet]
    const archived = { ...pet, archivedAt: '2026-10-23T00:00:00Z' }
    api.archiveAccountPet.mockResolvedValueOnce(archived).mockResolvedValueOnce({ ...pet, archivedAt: null })
    await state.archive(pet); expect(state.activePets.value).toEqual([]); expect(state.archivedPets.value).toEqual([archived])
    await state.archive(archived); expect(state.activePets.value).toHaveLength(1)
    expect(api.archiveAccountPet.mock.calls).toEqual([[pet.id, true], [pet.id, false]])
    expect(api.deleteAccountPet).not.toHaveBeenCalled(); expect(api.saveAccountPet).not.toHaveBeenCalled(); scope.stop()
  })
  it('does not create duplicate pets after a photo failure and keeps the saved profile visible', async () => {
    const { state, scope } = setup(); state.edit()
    const file = new Blob(['fixture'], { type: 'image/webp' })
    api.saveAccountPet.mockResolvedValue(pet)
    api.uploadAccountPetPhoto.mockRejectedValueOnce(new Error('private failure')).mockResolvedValueOnce({ ...pet, hasPhoto: true })
    await state.save({ values: { nickname: pet.nickname }, photoFile: file })
    expect(state.pets.value).toEqual([pet]); expect(state.editing.value.id).toBe(pet.id)
    expect(state.editorOpen.value).toBe(true); expect(state.error.value).toContain('details were saved')
    await state.save({ values: { nickname: pet.nickname }, photoFile: file })
    expect(api.saveAccountPet.mock.calls.map(call => call[0])).toEqual([undefined, pet.id])
    expect(state.pets.value).toHaveLength(1); expect(state.pets.value[0].hasPhoto).toBe(true); scope.stop()
  })
  it('removes only an existing photo and ignores late results after leaving the account', async () => {
    const { state, scope } = setup(); state.edit({ ...pet, hasPhoto: true })
    api.saveAccountPet.mockResolvedValue({ ...pet, hasPhoto: true }); api.deleteAccountPetPhoto.mockResolvedValue(pet)
    await state.save({ values: { nickname: pet.nickname }, removePhoto: true })
    expect(api.deleteAccountPetPhoto).toHaveBeenCalledWith(pet.id)
    state.edit(); let finish; api.saveAccountPet.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const pending = state.save({ nickname: 'Later' }); scope.stop(); finish({ ...pet, id: 'new' }); await pending
    expect(state.pets.value).toHaveLength(1)
  })
})
