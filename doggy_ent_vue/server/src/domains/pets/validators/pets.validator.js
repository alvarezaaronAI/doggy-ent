import {
  PET_LIFE_STAGES,
  PET_PROTEIN_PREFERENCES,
  PET_SIZE_BANDS,
  PET_TREAT_PURPOSES,
} from '../constants/pets.constants.js'
import { findPetBreed } from '../constants/petCatalog.generated.js'
import { PET_WEIGHT_UNITS, validPetWeightGrams } from '../constants/petWeight.generated.js'

const FIELDS = new Set([
  'nickname', 'lifeStage', 'sizeBand', 'proteinPreferences', 'treatPurpose',
  'breedId', 'isMixed', 'birthdayMonth', 'birthdayDay', 'treatPurposes',
  'weightGrams', 'weightUnit',
])
const invalid = () => Object.assign(
  new Error('Check your pet profile fields.'),
  { statusCode: 400 },
)
const isObject = value => value !== null && typeof value === 'object'
  && [Object.prototype, null].includes(Object.getPrototypeOf(value))

function optionalChoice(value, choices) {
  if (value == null) return null
  if (typeof value !== 'string' || !choices.includes(value)) throw invalid()
  return value
}

function choicesArray(value, choices) {
  if (!Array.isArray(value) || value.length > choices.length
    || new Set(value).size !== value.length
    || value.some(choice => typeof choice !== 'string' || !choices.includes(choice))) throw invalid()
  return [...value]
}

export function validatePetInput(input, { update = false } = {}) {
  if (!isObject(input) || Object.keys(input).some(key => !FIELDS.has(key))) {
    throw invalid()
  }
  if (typeof input.nickname !== 'string') throw invalid()
  const nickname = input.nickname.trim()
  if (nickname.length < 1 || nickname.length > 60) throw invalid()

  const result = {
    nickname,
    lifeStage: optionalChoice(input.lifeStage, PET_LIFE_STAGES),
    sizeBand: optionalChoice(input.sizeBand, PET_SIZE_BANDS),
    proteinPreferences: choicesArray(input.proteinPreferences === undefined ? [] : input.proteinPreferences, PET_PROTEIN_PREFERENCES),
    treatPurpose: optionalChoice(input.treatPurpose, PET_TREAT_PURPOSES),
  }
  if (!update || Object.hasOwn(input, 'breedId')) {
    if (input.breedId != null && (typeof input.breedId !== 'string' || !findPetBreed(input.breedId))) throw invalid()
    result.breedId = input.breedId ?? null
  }
  if (!update || Object.hasOwn(input, 'isMixed')) {
    if (input.isMixed !== undefined && typeof input.isMixed !== 'boolean') throw invalid()
    result.isMixed = input.isMixed ?? false
  }
  if (Object.hasOwn(input, 'treatPurposes')) {
    result.treatPurposes = choicesArray(input.treatPurposes, PET_TREAT_PURPOSES)
    if (!Object.hasOwn(input, 'treatPurpose')) {
      if (update) delete result.treatPurpose
      else result.treatPurpose = result.treatPurposes[0] ?? null
    }
  } else if (!update) {
    result.treatPurposes = result.treatPurpose ? [result.treatPurpose] : []
  }
  const hasMonth = Object.hasOwn(input, 'birthdayMonth'), hasDay = Object.hasOwn(input, 'birthdayDay')
  if (hasMonth !== hasDay) throw invalid()
  if (!update || hasMonth) {
    const month = input.birthdayMonth ?? null, day = input.birthdayDay ?? null
    if ((month === null) !== (day === null)) throw invalid()
    if (month !== null && (!Number.isInteger(month) || !Number.isInteger(day)
      || month < 1 || month > 12 || day < 1
      || day > [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])) throw invalid()
    result.birthdayMonth = month
    result.birthdayDay = day
  }
  const hasWeight = Object.hasOwn(input, 'weightGrams'), hasUnit = Object.hasOwn(input, 'weightUnit')
  if (hasWeight !== hasUnit) throw invalid()
  if (!update || hasWeight) {
    const grams = input.weightGrams ?? null, unit = input.weightUnit ?? null
    if ((grams === null) !== (unit === null)
      || (grams !== null && (!validPetWeightGrams(grams) || !PET_WEIGHT_UNITS.includes(unit)))) throw invalid()
    result.weightGrams = grams
    result.weightUnit = unit
  }
  return result
}

export function validatePetArchiveInput(input) {
  if (!isObject(input) || Object.keys(input).length !== 1 || typeof input.archived !== 'boolean') throw invalid()
  return input.archived
}

export function validateEmptyPetInput(input) {
  if (input === undefined) return
  if (!isObject(input) || Object.keys(input).length) throw invalid()
}

export function validatePetId(id) {
  if (typeof id !== 'string' || !/^c[a-z0-9]{24}$/.test(id)) {
    throw Object.assign(new Error('Pet not found.'), { statusCode: 404 })
  }
  return id
}
