export const PET_WEIGHT_UNITS = Object.freeze(['LB', 'KG'])
export const MIN_PET_WEIGHT_GRAMS = 100
export const MAX_PET_WEIGHT_GRAMS = 250000
const gramsPerUnit = Object.freeze({ LB: 453.59237, KG: 1000 })

export function validPetWeightGrams(value) {
  return Number.isInteger(value) && value >= MIN_PET_WEIGHT_GRAMS && value <= MAX_PET_WEIGHT_GRAMS
}

export function parsePetWeight(value, unit) {
  const text = String(value ?? '').trim().replace(',', '.')
  if (!text) return null
  if (!PET_WEIGHT_UNITS.includes(unit) || !/^\d+(?:\.\d{1,2})?$/.test(text)) return NaN
  const grams = Math.round(Number(text) * gramsPerUnit[unit])
  return validPetWeightGrams(grams) ? grams : NaN
}

export function petWeightInput(grams, unit = 'LB') {
  if (!validPetWeightGrams(grams) || !PET_WEIGHT_UNITS.includes(unit)) return ''
  return String(Number((grams / gramsPerUnit[unit]).toFixed(2)))
}

export function petWeightLabel(grams, unit = 'LB') {
  const value = petWeightInput(grams, unit)
  return value ? `${value} ${unit === 'KG' ? 'kg' : 'lb'}` : ''
}
