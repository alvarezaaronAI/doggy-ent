import { ref } from 'vue'
import { useAccountProfile } from './useAccountProfile.js'
import { useAccountAuth } from './useAccountAuth.js'
import { toAccountProfilePayload } from '../mappers/accountProfile.mapper.js'

export function useAccountProfileEditor() {
  const account = useAccountProfile()
  const section = ref('')
  const notice = ref('')
  const { loadSession } = useAccountAuth()
  async function openEditor(target) {
    notice.value = ''
    await account.loadProfile()
    if (!account.error.value) section.value = target
  }
  async function saveEditor(values) {
    try {
      await account.saveProfile(
        toAccountProfilePayload(account.profile.value, section.value, values)
      )
      section.value = ''
      notice.value = 'Your changes have been saved.'
      await loadSession()
    } catch {
      // The profile composable exposes the error without closing the editor.
    }
  }
  return { ...account, section, notice, openEditor, saveEditor }
}
