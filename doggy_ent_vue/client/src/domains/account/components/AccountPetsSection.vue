<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { Archive, Gift, PawPrint, Plus, ShieldCheck, Trash2 } from '@lucide/vue'
import AccountPetEditor from './AccountPetEditor.vue'
import AccountPetCard from './AccountPetCard.vue'
import { useAccountPets } from '../composables/useAccountPets.js'
import { PET_PROFILE_LIMIT } from '../constants/petProfile.constants.js'
const { pets, activePets, archivedPets, loading, saving, error, notice, editing, editorOpen, removing, load, edit, closeEditor, save, archive, remove } = useAccountPets()
const editor = ref(null), pageHeading = ref(null)
let opener
function startEdit(pet) { opener = document.activeElement; edit(pet); nextTick(() => editor.value?.focus()) }
async function archivePet(pet) {
  const restoring = Boolean(pet.archivedAt)
  await archive(pet)
  await nextTick()
  if (error.value) return
  const restoredAction = restoring && document.querySelector(`[data-pet-id="${pet.id}"] .pet-edit-action`)
  if (restoredAction) restoredAction.focus(); else pageHeading.value?.focus()
}
watch(editorOpen, async open => { if (!open) { await nextTick(); if (opener?.isConnected) opener.focus(); else pageHeading.value?.focus() } })
onMounted(load)
</script>
<template>
  <div class="min-w-0">
    <AccountPetEditor v-if="editorOpen" ref="editor" :pet="editing" :saving="saving" :error="error" @close="closeEditor" @save="save" />
    <template v-else>
      <header class="account-row mb-6 !items-start"><div><h1 ref="pageHeading" tabindex="-1">Your pack</h1><p class="account-muted mt-2 text-sm">The ones you shop for, all in one place.</p></div><button class="account-button account-button--primary shadow-sm" type="button" :disabled="loading || saving || pets.length >= PET_PROFILE_LIMIT" @click="startEdit()"><Plus :size="17" aria-hidden="true" />Add a pet</button></header>
      <p v-if="loading" class="account-muted py-6" role="status">Loading your pets...</p>
      <div v-if="error" role="alert" class="mb-5 rounded-md border border-red-200 bg-red-50 p-4"><p class="account-error">{{ error }}</p><button type="button" class="account-button mt-3" :disabled="saving" @click="load">Try again</button></div>
      <p v-if="notice" role="status" class="account-notice mb-5">{{ notice }}</p>
      <div v-if="!loading && !error && !activePets.length" class="mb-6 rounded-lg border border-[var(--account-line)] bg-white p-7 shadow-sm"><PawPrint :size="32" class="text-[var(--account-green)]" aria-hidden="true" /><h2 class="mt-3">{{ archivedPets.length ? 'Your pack has a quiet moment' : 'A little hello goes a long way' }}</h2><p class="account-muted mt-2 max-w-md text-sm">{{ archivedPets.length ? 'Your archived profiles are kept below. Restore one whenever you are ready.' : 'Add a nickname, a photo and the details you want to share. A pet profile is never needed to shop or check out.' }}</p></div>
      <div class="grid grid-cols-1 gap-5 min-[620px]:grid-cols-2"><AccountPetCard v-for="pet in activePets" :key="pet.id" :pet="pet" :busy="saving" @edit="startEdit" @archive="archivePet" /></div>
      <details v-if="archivedPets.length" class="mt-7"><summary class="account-button list-none [&::-webkit-details-marker]:hidden"><Archive :size="17" aria-hidden="true" />Archived pets ({{ archivedPets.length }})</summary><p class="account-muted mt-3 text-sm">Kept with care. Restore a profile from its options whenever you need it.</p><div class="mt-4 grid grid-cols-1 gap-5 min-[620px]:grid-cols-2"><AccountPetCard v-for="pet in archivedPets" :key="pet.id" :pet="pet" :busy="saving" @edit="startEdit" @archive="archivePet" /></div></details>
      <p v-if="pets.length >= PET_PROFILE_LIMIT" class="account-muted mt-4 text-xs">You have reached {{ PET_PROFILE_LIMIT }} profiles, including archived pets. You can still edit, restore or remove their details.</p>
      <aside class="mt-7 flex items-start gap-3 border-l-[3px] border-[var(--account-green)] bg-[var(--account-soft)] p-5 text-sm" aria-label="Future profile offers"><Gift :size="20" class="mt-1 shrink-0 text-[var(--account-green)]" aria-hidden="true" /><div><h2 class="!text-base">One account, one future profile offer</h2><p class="account-muted mt-1 text-xs">No offer is active yet. Future profile offers will be limited to one per account, not per pet. Adding, editing, archiving or removing pets will not unlock another offer.</p></div></aside>
      <p class="account-muted mt-4 text-xs">Sharing pet details is optional. Your account and checkout work without them.</p>
      <details class="mt-4 border-t border-[var(--account-line)] pt-4"><summary class="account-link list-none [&::-webkit-details-marker]:hidden"><ShieldCheck :size="16" aria-hidden="true" />Pet data & privacy</summary><p class="account-muted mt-3 text-sm">Archive keeps a profile for later. Removing details deletes its saved preferences and private photo. Limited dated account activity remains for account security and later review; it does not contain your pet's name, photo or preferences.</p><RouterLink class="account-link mt-3 !text-xs" to="/privacy">Read our privacy draft</RouterLink><ul class="mt-4 divide-y divide-[var(--account-line)]"><li v-for="pet in pets" :key="pet.id" class="py-3"><div class="flex flex-wrap items-center justify-between gap-3"><span class="min-w-0 text-sm [overflow-wrap:anywhere]">{{ pet.nickname }}</span><button type="button" class="account-button !text-xs" :disabled="saving" :aria-label="`Remove ${pet.nickname}'s details`" @click="removing = pet.id"><Trash2 :size="15" aria-hidden="true" />Remove details</button></div><div v-if="removing === pet.id" class="mt-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm" role="group" :aria-label="`Confirm removal of ${pet.nickname}`"><p>Remove {{ pet.nickname }}'s details and photo? This cannot be undone. Orders and limited account activity will remain.</p><div class="mt-3 flex flex-wrap gap-2"><button type="button" class="account-button" :disabled="saving" @click="removing = ''">Keep details</button><button type="button" class="account-button !border-red-300 !text-red-800" :disabled="saving" @click="remove(pet)">{{ saving ? 'Removing...' : 'Remove pet details' }}</button></div></div></li></ul></details>
    </template>
  </div>
</template>
