import { PET_BREEDS } from '../constants/petCatalog.generated.js'
import { PET_MONTHS } from '../constants/petProfile.constants.js'
import { parsePetWeight, petWeightInput, validPetWeightGrams } from '../constants/petWeight.generated.js'

export function petWeightGramsFromForm(form) {
  const value = String(form.weight ?? '').trim().replace(',', '.')
  if (!value) return null
  // Keep the stored gram precision when displaying or switching rounded lb/kg values.
  if (validPetWeightGrams(form.weightOriginalGrams) && value === petWeightInput(form.weightOriginalGrams, form.weightUnit)) return form.weightOriginalGrams
  return parsePetWeight(value, form.weightUnit)
}

export function petPurposes(pet = {}) {
  return Array.isArray(pet.treatPurposes) ? [...pet.treatPurposes] : pet.treatPurpose ? [pet.treatPurpose] : []
}
export function toPetProfileForm(pet = {}) {
  const weightUnit = pet.weightUnit || 'LB'
  return { nickname: pet.nickname || '', lifeStage: pet.lifeStage || '', sizeBand: pet.sizeBand || '', proteinPreferences: [...(pet.proteinPreferences || [])], treatPurposes: petPurposes(pet), breedId: pet.breedId || '', isMixed: pet.isMixed === true, birthdayMonth: pet.birthdayMonth || '', birthdayDay: pet.birthdayDay || '', weight: petWeightInput(pet.weightGrams, weightUnit), weightUnit, weightOriginalGrams: pet.weightGrams ?? null }
}
export function toPetProfilePayload(form) {
  const weightGrams = petWeightGramsFromForm(form)
  if (Number.isNaN(weightGrams)) throw new Error('Check your pet weight.')
  return { nickname: String(form.nickname || '').trim(), lifeStage: form.lifeStage || null, sizeBand: form.sizeBand || null, proteinPreferences: [...new Set(form.proteinPreferences || [])], treatPurposes: [...new Set(form.treatPurposes || [])], breedId: form.breedId || null, isMixed: form.isMixed === true, birthdayMonth: form.birthdayMonth ? Number(form.birthdayMonth) : null, birthdayDay: form.birthdayDay ? Number(form.birthdayDay) : null, weightGrams, weightUnit: weightGrams === null ? null : form.weightUnit }
}
export function petBreedLabel(pet) {
  const breed = PET_BREEDS.find(option => option.value === pet.breedId)?.label || ''
  return [breed, pet.isMixed ? 'Mixed breed' : ''].filter(Boolean).join(' · ')
}
export function petBirthdayLabel(pet) {
  const month = PET_MONTHS.find(option => option.value === Number(pet.birthdayMonth))?.label
  return month && pet.birthdayDay ? `${month} ${pet.birthdayDay} birthday` : ''
}
export function birthdayDays(month) {
  return month ? new Date(Date.UTC(2000, Number(month), 0)).getUTCDate() : 31
}
