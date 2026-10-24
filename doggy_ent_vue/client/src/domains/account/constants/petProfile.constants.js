export const PET_LIFE_STAGES = [
  { value: 'PUPPY', label: 'Puppy', icon: 'baby' }, { value: 'ADULT', label: 'Adult', icon: 'paw' }, { value: 'SENIOR', label: 'Senior', icon: 'heart' },
]
export const PET_SIZE_BANDS = [
  { value: 'SMALL', label: 'Small', icon: 'dog', hintLb: 'Under 25 lb', hintKg: 'Under 11 kg' }, { value: 'MEDIUM', label: 'Medium', icon: 'dog', hintLb: '25-59 lb', hintKg: '11-26 kg' }, { value: 'LARGE', label: 'Large', icon: 'dog', hintLb: '60-99 lb', hintKg: '27-44 kg' }, { value: 'GIANT', label: 'Giant', icon: 'dog', hintLb: '100+ lb', hintKg: '45+ kg' },
]
export const PET_PROTEINS = ['CHICKEN', 'BEEF', 'TURKEY', 'DUCK', 'LAMB', 'SALMON'].map(value => ({ value, label: value[0] + value.slice(1).toLowerCase() }))
export const PET_TREAT_PURPOSES = [
  { value: 'TRAINING', label: 'Training' }, { value: 'REWARD', label: 'Everyday rewards' }, { value: 'ENRICHMENT', label: 'Enrichment' }, { value: 'BONDING', label: 'Bonding and play' }, { value: 'EVERYDAY', label: 'Everyday treats' },
]
export const PET_MONTHS = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, index, 1))) }))
export const PET_PROFILE_LIMIT = 10
export function petOptionLabel(options, value) { return options.find(option => option.value === value)?.label || '' }
