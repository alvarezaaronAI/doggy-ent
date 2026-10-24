import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import AccountPetCard from '../../../src/domains/account/components/AccountPetCard.vue'
import AccountPetEditor from '../../../src/domains/account/components/AccountPetEditor.vue'
import { validatePetForm, validatePetPhoto } from '../../../src/domains/account/validators/petProfile.validator.js'
import { birthdayDays, petBirthdayLabel, petBreedLabel, toPetProfileForm } from '../../../src/domains/account/mappers/petProfile.mapper.js'
import { PET_BREEDS } from '../../../src/domains/account/constants/petCatalog.generated.js'
const render = (component, props) => renderToString(createSSRApp(component, props))
const pet = { id: 'c123456789012345678901234', nickname: '<Fixture Pup>', proteinPreferences: ['DUCK'], treatPurposes: ['TRAINING', 'BONDING'], lifeStage: 'ADULT', sizeBand: 'LARGE', breedId: 'labrador-retriever', isMixed: true, birthdayMonth: 7, birthdayDay: 14 }
describe('connected photo-led pet presentation and safe inputs', () => {
  it('keeps canonical unique breed IDs and aliases instead of saving arbitrary search text', () => {
    expect(PET_BREEDS.length).toBeGreaterThanOrEqual(58)
    expect(new Set(PET_BREEDS.map(item => item.value)).size).toBe(PET_BREEDS.length)
    expect(petBreedLabel(pet)).toContain('Labrador Retriever')
    expect(petBreedLabel(pet)).toContain('Mixed breed')
    expect(validatePetForm({ ...toPetProfileForm(pet), breedId: 'Labrador Typo' }, true, true)).toHaveProperty('breedId')
  })
  it('renders complete escaped cards and direct Edit with the quiet birthday row below', async () => {
    const html = await render(AccountPetCard, { pet })
    expect(html).toContain('&lt;Fixture Pup&gt;'); expect(html).not.toContain('<Fixture Pup>')
    for (const text of ['Life stage', 'Size', 'Favourite proteins', 'Treats are for', 'Bonding and play', 'Mixed breed', 'July 14 birthday', 'Edit pet']) expect(html).toContain(text)
    expect(html.indexOf('Edit pet')).toBeLessThan(html.indexOf('July 14 birthday'))
    expect(html).not.toContain('View profile'); expect(html).toContain('Illustration')
    expect(html).not.toContain('petCreatedAt'); expect(html).not.toContain('isFraud')
  })
  it('locks the saved birthday and does not render an adjustment request', async () => {
    const html = await render(AccountPetEditor, { pet })
    expect(html).toContain('Saved birthday'); expect(html).toContain('cannot be changed')
    expect(html).not.toContain('>Month<'); expect(html).not.toContain('Request adjustment')
    expect(html).toContain('type="checkbox"'); expect(html).toContain('Choose as many as you like')
    expect(html).toContain('Private to your account')
  })
  it('allows optional birthdays but validates calendar pairs and confirmation before the first save', () => {
    const form = toPetProfileForm({ nickname: 'Pet' })
    expect(validatePetForm(form)).toEqual({})
    expect(validatePetForm({ ...form, birthdayMonth: 7 })).toHaveProperty('birthday')
    expect(validatePetForm({ ...form, birthdayMonth: 2, birthdayDay: 30 }, true)).toHaveProperty('birthday')
    expect(validatePetForm({ ...form, birthdayMonth: 2, birthdayDay: 29 }, false)).toHaveProperty('birthday')
    expect(validatePetForm({ ...form, birthdayMonth: 2, birthdayDay: 29 }, true)).toEqual({})
    expect(birthdayDays(2)).toBe(29); expect(petBirthdayLabel(pet)).toBe('July 14 birthday')
  })
  it('rejects unsuitable or oversize photo inputs before upload', () => {
    expect(validatePetPhoto({ type: 'image/svg+xml', size: 100 })).toContain('JPEG')
    expect(validatePetPhoto({ type: 'image/jpeg', size: 6 * 1024 * 1024 })).toContain('5 MB')
    expect(validatePetPhoto({ type: 'image/webp', size: 100 })).toBe('')
  })
})
