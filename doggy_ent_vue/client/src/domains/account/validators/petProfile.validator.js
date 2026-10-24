import { PET_BREEDS } from '../constants/petCatalog.generated.js'
import { birthdayDays, petWeightGramsFromForm } from '../mappers/petProfile.mapper.js'

export function validatePetForm(form, birthdayConfirmed = false, birthdayLocked = false) {
  const errors = {}
  if (!String(form.nickname || '').trim()) errors.nickname = 'Add a nickname for your pet.'
  else if (form.nickname.trim().length > 60) errors.nickname = 'Use 60 characters or fewer.'
  if (form.breedId && !PET_BREEDS.some(option => option.value === form.breedId)) errors.breedId = 'Choose a breed from the list, or select Not sure.'
  if (Number.isNaN(petWeightGramsFromForm(form))) errors.weight = form.weightUnit === 'KG' ? 'Enter 0.1 to 250 kg, with up to two decimal places, or leave weight empty.' : 'Enter 0.22 to 551.15 lb, with up to two decimal places, or leave weight empty.'
  const month = Number(form.birthdayMonth), day = Number(form.birthdayDay)
  if (form.birthdayMonth || form.birthdayDay) {
    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > birthdayDays(month)) errors.birthday = 'Choose a valid month and day, or leave both empty.'
    else if (!birthdayLocked && !birthdayConfirmed) errors.birthday = 'Confirm the birthday is correct before saving it.'
  }
  return errors
}

export function validatePetPhoto(file) {
  if (!file) return ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPEG, PNG or WebP photo.'
  if (!file.size || file.size > 5 * 1024 * 1024) return 'Choose a photo smaller than 5 MB.'
  return ''
}
