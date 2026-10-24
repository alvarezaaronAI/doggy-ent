<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { Check, ChevronDown, Search } from '@lucide/vue'
import { PET_BREEDS } from '../constants/petCatalog.generated.js'
const props = defineProps({ modelValue: { type: String, default: '' }, error: { type: String, default: '' }, disabled: Boolean })
const emit = defineEmits(['update:modelValue'])
const picker = ref(null), query = ref(''), id = useId()
const selected = computed(() => PET_BREEDS.find(breed => breed.value === props.modelValue))
const matches = computed(() => {
  const normalized = query.value.toLocaleLowerCase().trim()
  return normalized ? PET_BREEDS.filter(breed => [breed.label, ...(breed.aliases || [])].some(label => label.toLocaleLowerCase().includes(normalized))) : PET_BREEDS.slice(0, 8)
})
function choose(value) { emit('update:modelValue', value); picker.value.open = false; query.value = ''; picker.value.querySelector('summary').focus() }
function closeOutside(event) { if (picker.value && !picker.value.contains(event.target)) picker.value.open = false }
function escape(event) { if (event.key === 'Escape') { picker.value.open = false; picker.value.querySelector('summary').focus() } }
onMounted(() => document.addEventListener('click', closeOutside))
onBeforeUnmount(() => document.removeEventListener('click', closeOutside))
</script>
<template>
  <div>
    <span :id="`${id}-label`" class="account-field">Breed <span class="account-muted font-normal">(optional)</span></span>
    <details ref="picker" class="relative mt-2" @keydown="escape">
      <summary class="account-input !mt-0 !flex list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden" :class="error ? '!border-red-300 !bg-red-50' : ''" :aria-labelledby="`${id}-label ${id}-selection`" :aria-describedby="`${id}-help`" :aria-invalid="Boolean(error)" @click="disabled && $event.preventDefault()"><span :id="`${id}-selection`">{{ selected?.label || 'Choose a breed' }}</span><ChevronDown :size="17" class="shrink-0" aria-hidden="true" /></summary>
      <div class="mt-2 rounded-lg border border-[var(--account-line)] bg-white p-3 shadow-md">
        <label class="account-field text-sm" :for="`${id}-search`">Find a breed</label><div class="relative"><Search :size="17" class="absolute left-3 top-[22px] text-[var(--account-muted)]" aria-hidden="true" /><input :id="`${id}-search`" v-model="query" class="account-input !pl-10" placeholder="Try Labrador or Lab" autocomplete="off" :disabled="disabled" /></div>
        <ul class="mt-3 max-h-56 overflow-y-auto"><li v-for="breed in matches" :key="breed.value"><button type="button" class="flex min-h-11 w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm hover:bg-[var(--account-soft)]" :class="modelValue === breed.value ? 'bg-[var(--account-soft)] text-[var(--account-green)]' : ''" :disabled="disabled" @click="choose(breed.value)">{{ breed.label }}<Check v-if="modelValue === breed.value" :size="16" aria-hidden="true" /></button></li></ul>
        <p v-if="!matches.length" class="account-muted px-3 py-3 text-sm">No matching breed. You can choose Not listed or Not sure.</p>
        <div class="mt-2 flex flex-wrap gap-2 border-t border-[var(--account-line)] pt-3"><button v-for="option in PET_BREEDS.filter(breed => /not sure|not listed/i.test(breed.label))" :key="option.value" type="button" class="account-button !px-3 !text-xs" :disabled="disabled" @click="choose(option.value)">{{ option.label }}</button><button v-if="modelValue" class="account-button !px-3 !text-xs" type="button" :disabled="disabled" @click="choose('')">Clear breed</button></div>
      </div>
    </details>
    <p :id="`${id}-help`" class="mt-2 text-xs" :class="error ? 'account-error' : 'account-muted'">{{ error || 'Search common breeds. Pick a saved choice so spelling stays consistent.' }}</p>
  </div>
</template>
