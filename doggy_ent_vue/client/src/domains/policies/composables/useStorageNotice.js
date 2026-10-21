import { onMounted, ref } from 'vue'
import { acknowledgeStorageNotice, hasSeenStorageNotice } from '../utils/storageNotice.js'

const acknowledged = ref(false)
export function useStorageNotice() {
  const ready = ref(false)
  onMounted(() => {
    try { acknowledged.value = hasSeenStorageNotice(window.localStorage) }
    catch { acknowledged.value = false }
    ready.value = true
  })
  function dismiss() {
    acknowledged.value = true
    try { acknowledgeStorageNotice(window.localStorage) }
    catch { /* Acknowledgment still works in memory when storage is blocked. */ }
  }
  return { acknowledged, ready, dismiss }
}
