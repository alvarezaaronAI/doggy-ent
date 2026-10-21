export const STORAGE_NOTICE_KEY = 'doggy-ent-storage-notice'
export const STORAGE_NOTICE_REVISION = '2026-10-20'

export function hasSeenStorageNotice(storage) {
  try { return storage.getItem(STORAGE_NOTICE_KEY) === STORAGE_NOTICE_REVISION }
  catch { return false }
}

export function acknowledgeStorageNotice(storage) {
  try { storage.setItem(STORAGE_NOTICE_KEY, STORAGE_NOTICE_REVISION); return true }
  catch { return false }
}
