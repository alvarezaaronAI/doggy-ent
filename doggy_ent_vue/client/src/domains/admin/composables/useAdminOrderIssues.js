import { reactive, watch } from 'vue'
import {
  addAdminOrderIssueMessage,
  fetchAdminOrderIssues,
  updateAdminOrderIssue,
} from '../api/adminSupport.api'
import { useAdminIssueWorkspace } from './useAdminIssueWorkspace'

export function useAdminOrderIssues() {
  const workspace = useAdminIssueWorkspace({
    fetchIssues: fetchAdminOrderIssues,
    updateIssue: updateAdminOrderIssue,
    defaults: { status: 'OPEN', priority: 'NORMAL', resolutionSummary: '' },
    initialFilters: { search: '', status: '', category: '' },
  })
  const messageForm = reactive({
    body: '',
    visibility: 'INTERNAL',
    emailRequested: false,
  })
  function clearMessage() {
    Object.assign(messageForm, {
      body: '',
      visibility: 'INTERNAL',
      emailRequested: false,
    })
  }
  watch(workspace.selectedCaseNumber, clearMessage)
  async function addMessage() {
    if (
      !workspace.selectedIssue.value ||
      workspace.saving.value ||
      !messageForm.body.trim()
    )
      return
    workspace.saving.value = true
    workspace.error.value = ''
    workspace.message.value = ''
    try {
      const payload = { ...messageForm, body: messageForm.body.trim() }
      const updated = await addAdminOrderIssueMessage(
        workspace.selectedCaseNumber.value,
        payload,
      )
      workspace.replaceIssue(updated)
      workspace.message.value = payload.emailRequested
        ? 'Message saved. Email follow-up marked, not sent.'
        : 'Message saved. No email was sent.'
      clearMessage()
    } catch (cause) {
      workspace.error.value =
        cause.message || 'Unable to save message. Your draft is still here.'
    } finally {
      workspace.saving.value = false
    }
  }
  return { ...workspace, messageForm, clearMessage, addMessage }
}
