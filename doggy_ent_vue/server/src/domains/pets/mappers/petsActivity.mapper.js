const profileFields = Object.freeze([
  'nickname', 'lifeStage', 'sizeBand', 'proteinPreferences', 'treatPurpose',
  'breedId', 'isMixed', 'birthdayMonth', 'birthdayDay', 'treatPurposes',
  'weightGrams', 'weightUnit',
])
const activityFields = Object.freeze([...profileFields, 'archivedAt', 'photo'])

const messages = Object.freeze({
  PET_CREATED: 'Pet profile added.',
  PET_UPDATED: 'Pet profile updated.',
  PET_DELETED: 'Pet profile removed.',
  PET_ARCHIVED: 'Pet profile archived.',
  PET_RESTORED: 'Pet profile restored.',
  PET_PHOTO_CHANGED: 'Pet photo updated.',
  PET_PHOTO_REMOVED: 'Pet photo removed.',
})

export function changedPetFields(before, after) {
  return profileFields.filter(field => {
    if (!Object.hasOwn(after, field)) return false
    if (field === 'proteinPreferences' || field === 'treatPurposes') {
      return JSON.stringify([...(before[field] || [])].sort())
        !== JSON.stringify([...(after[field] || [])].sort())
    }
    return (before[field] ?? (field === 'isMixed' ? false : null)) !== (after[field] ?? null)
  })
}

export function mapPetActivity({ userId, type, pet, changedFields = [], occurredAt = new Date() }) {
  if (!Object.hasOwn(messages, type)) throw new Error('Unsupported pet activity.')
  const addedAt = new Date(pet.createdAt)
  return {
    userId,
    type,
    message: messages[type],
    changedByType: 'CUSTOMER',
    changedBy: userId,
    createdAt: occurredAt,
    metadata: {
      schemaVersion: 1,
      petId: pet.id,
      petCreatedAt: addedAt.toISOString(),
      petUpdatedAt: new Date(pet.updatedAt).toISOString(),
      profileAgeSeconds: Math.max(0, Math.floor((occurredAt.getTime() - addedAt.getTime()) / 1000)),
      changedFields: activityFields.filter(field => changedFields.includes(field)),
    },
  }
}
