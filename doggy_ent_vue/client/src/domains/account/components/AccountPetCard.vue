<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Archive, ArrowRight, Bone, CakeSlice, Dog, Ellipsis, PawPrint, Pencil, RotateCcw, Utensils } from '@lucide/vue'
import AccountPetPhoto from './AccountPetPhoto.vue'
import { PET_LIFE_STAGES, PET_SIZE_BANDS, PET_PROTEINS, PET_TREAT_PURPOSES, petOptionLabel } from '../constants/petProfile.constants.js'
import { petBirthdayLabel, petBreedLabel, petPurposes } from '../mappers/petProfile.mapper.js'
import { petWeightLabel } from '../constants/petWeight.generated.js'
const props = defineProps({ pet: { type: Object, required: true }, busy: Boolean })
const emit = defineEmits(['edit', 'archive'])
const options = ref(null)
const birthday = computed(() => petBirthdayLabel(props.pet))
function closeOutside(event) { if (options.value && !options.value.contains(event.target)) options.value.open = false }
function escape(event) { if (event.key === 'Escape' && options.value?.open) { options.value.open = false; options.value.querySelector('summary')?.focus() } }
function archive() { options.value.open = false; options.value.querySelector('summary')?.focus(); emit('archive', props.pet) }
onMounted(() => document.addEventListener('click', closeOutside))
onBeforeUnmount(() => document.removeEventListener('click', closeOutside))
</script>
<template>
  <article :data-pet-id="pet.id" class="min-w-0 overflow-visible rounded-lg border border-[var(--account-line)] bg-white shadow-[0_4px_16px_rgb(36_51_45/7%)]" :aria-label="`${pet.nickname} pet profile`">
    <div class="overflow-hidden rounded-t-lg"><AccountPetPhoto :pet="pet" /></div>
    <div class="p-5 sm:p-6">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0"><h2 class="!text-[22px] [overflow-wrap:anywhere]">{{ pet.nickname }}</h2><p class="account-muted mt-2 text-sm [overflow-wrap:anywhere]">{{ petBreedLabel(pet) || 'Breed not added' }}</p></div>
        <details ref="options" class="relative shrink-0" @keydown="escape"><summary class="account-button !px-3 list-none [&::-webkit-details-marker]:hidden" :aria-label="`Options for ${pet.nickname}`"><Ellipsis :size="18" aria-hidden="true" /></summary><div class="absolute right-0 top-full z-10 mt-2 w-52 rounded-lg border border-[var(--account-line)] bg-white p-2 shadow-lg"><button type="button" class="account-button w-full !justify-start text-left" :disabled="busy" @click="archive"><component :is="pet.archivedAt ? RotateCcw : Archive" :size="16" aria-hidden="true" />{{ pet.archivedAt ? 'Restore pet' : 'Archive pet' }}</button><p class="account-muted mt-2 px-2 text-xs">{{ pet.archivedAt ? 'Bring this profile back to your pack.' : 'Keep their details without showing them in your pack.' }}</p></div></details>
      </div>
      <p v-if="pet.archivedAt" class="account-muted mt-3 text-xs">Archived profile</p>
      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <div><dt class="account-muted flex items-center gap-2 text-xs"><PawPrint :size="15" aria-hidden="true" />Life stage</dt><dd class="mt-1">{{ petOptionLabel(PET_LIFE_STAGES, pet.lifeStage) || 'Not added' }}</dd></div>
        <div><dt class="account-muted flex items-center gap-2 text-xs"><Dog :size="15" aria-hidden="true" />Size</dt><dd class="mt-1">{{ petOptionLabel(PET_SIZE_BANDS, pet.sizeBand) || 'Not added' }}<span v-if="petWeightLabel(pet.weightGrams, pet.weightUnit)" class="account-muted mt-1 block text-xs">{{ petWeightLabel(pet.weightGrams, pet.weightUnit) }}</span></dd></div>
        <div class="col-span-2"><dt class="account-muted flex items-center gap-2 text-xs"><Utensils :size="15" aria-hidden="true" />Favourite proteins</dt><dd class="mt-1 [overflow-wrap:anywhere]">{{ pet.proteinPreferences.map(value => petOptionLabel(PET_PROTEINS, value)).filter(Boolean).join(' · ') || 'Not added' }}</dd></div>
        <div class="col-span-2"><dt class="account-muted flex items-center gap-2 text-xs"><Bone :size="15" aria-hidden="true" />Treats are for</dt><dd class="mt-1 [overflow-wrap:anywhere]">{{ petPurposes(pet).map(value => petOptionLabel(PET_TREAT_PURPOSES, value)).filter(Boolean).join(' · ') || 'Not added' }}</dd></div>
      </dl>
      <button type="button" class="pet-edit-action account-button mt-5 w-full !justify-start shadow-sm" :disabled="busy" :aria-label="`Edit ${pet.nickname}`" @click="emit('edit', pet)"><Pencil :size="16" aria-hidden="true" />Edit pet<ArrowRight class="ml-auto" :size="17" aria-hidden="true" /></button>
      <p v-if="birthday" class="account-muted mt-4 flex items-center gap-3 border-t border-[var(--account-line)] pt-4 text-sm"><CakeSlice :size="17" class="shrink-0" aria-hidden="true" />{{ birthday }}</p>
    </div>
  </article>
</template>
