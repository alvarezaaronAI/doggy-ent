<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, useId, watch } from 'vue'
import { ArrowLeft, CakeSlice, Camera, LockKeyhole, Save, Scale, Trash2 } from '@lucide/vue'
import AccountPetPhoto from './AccountPetPhoto.vue'
import AccountPetBreedPicker from './AccountPetBreedPicker.vue'
import AccountPetChoices from './AccountPetChoices.vue'
import { birthdayDays, petBirthdayLabel, petWeightGramsFromForm, toPetProfileForm, toPetProfilePayload } from '../mappers/petProfile.mapper.js'
import { petWeightInput, validPetWeightGrams } from '../constants/petWeight.generated.js'
import { validatePetForm, validatePetPhoto } from '../validators/petProfile.validator.js'
import { PET_LIFE_STAGES, PET_SIZE_BANDS, PET_PROTEINS, PET_TREAT_PURPOSES, PET_MONTHS } from '../constants/petProfile.constants.js'

const props = defineProps({ pet: { type: Object, default: null }, saving: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['save', 'close'])
const form = reactive(toPetProfileForm(props.pet || {}))
const formElement = ref(null), heading = ref(null), errors = ref({}), confirmed = ref(false), photoFile = ref(null), photoPreview = ref(''), photoError = ref(''), removePhoto = ref(false)
const id = useId()
const photoInput = ref(null)
const locked = computed(() => Boolean(props.pet?.birthdayMonth && props.pet?.birthdayDay))
const days = computed(() => birthdayDays(form.birthdayMonth))
const purposes = computed(() => PET_TREAT_PURPOSES.filter(option => option.value !== 'EVERYDAY' || form.treatPurposes.includes('EVERYDAY')))
const sizeOptions = computed(() => PET_SIZE_BANDS.map(option => ({ ...option, hint: form.weightUnit === 'KG' ? option.hintKg : option.hintLb })))
function changeWeightUnit(event) {
  const grams = petWeightGramsFromForm(form)
  form.weightUnit = event.target.value
  if (validPetWeightGrams(grams)) { form.weightOriginalGrams = grams; form.weight = petWeightInput(grams, form.weightUnit); delete errors.value.weight }
}
watch(() => [form.birthdayMonth, form.birthdayDay], () => { confirmed.value = false })
function clearPreview() { if (photoPreview.value) URL.revokeObjectURL(photoPreview.value); photoPreview.value = '' }
function selectPhoto(event) {
  const file = event.target.files?.[0]
  if (!file) return
  photoError.value = validatePetPhoto(file)
  event.target.value = ''
  if (photoError.value) return
  clearPreview(); photoFile.value = file; removePhoto.value = false; photoPreview.value = URL.createObjectURL(file)
}
function clearPhoto() { clearPreview(); photoFile.value = null; removePhoto.value = true; photoError.value = '' }
async function dismissPhotoError() {
  photoError.value = ''
  await nextTick()
  photoInput.value?.focus()
}
async function submit() {
  if (props.saving) return
  errors.value = validatePetForm(form, confirmed.value, locked.value)
  if (Object.keys(errors.value).length || photoError.value) {
    await nextTick()
    formElement.value.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  emit('save', { values: toPetProfilePayload(form), photoFile: photoFile.value, removePhoto: removePhoto.value })
}
onBeforeUnmount(clearPreview)
defineExpose({ focus: () => heading.value?.focus() })
</script>
<template>
  <section aria-labelledby="pet-editor-heading" class="min-w-0">
    <button class="account-button mb-5" type="button" :disabled="saving" @click="emit('close')"><ArrowLeft :size="17" aria-hidden="true" />All pets</button>
    <h1 id="pet-editor-heading" ref="heading" tabindex="-1" class="!text-2xl outline-offset-4 [overflow-wrap:anywhere]">{{ pet ? `Edit ${pet.nickname}` : 'Meet your newest pack member' }}</h1>
    <p class="account-muted mt-2 max-w-xl text-sm">Only a nickname is needed. Add the details that help us get to know your pet; you can skip the rest.</p>
    <form ref="formElement" class="mt-6 rounded-lg border border-[var(--account-line)] bg-white p-5 shadow-[0_4px_16px_rgb(36_51_45/7%)] sm:p-7" novalidate :aria-busy="saving" @submit.prevent="submit">
      <fieldset :disabled="saving" class="space-y-7">
        <div class="grid items-start gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div class="overflow-hidden rounded-lg border border-[var(--account-line)]"><AccountPetPhoto :pet="pet" :preview="photoPreview" :cleared="removePhoto" /></div>
          <div>
            <h3 class="flex items-center gap-2"><Camera :size="18" aria-hidden="true" />Their photo <span class="account-muted text-sm font-normal">(optional)</span></h3>
            <p class="account-muted mt-2 text-sm">A clear photo of your pet. Private to your account, never added to the public image library.</p>
            <label class="account-button relative mt-3 overflow-hidden focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--account-green)]">
              <Camera :size="16" aria-hidden="true" />{{ photoFile || (pet?.hasPhoto && !removePhoto) ? 'Change photo' : 'Add a photo' }}
              <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="absolute inset-0 h-full w-full opacity-0" :aria-describedby="`${id}-photo-help`" :aria-invalid="Boolean(photoError)" aria-label="Choose pet photo" @change="selectPhoto" />
            </label>
            <button v-if="photoFile || (pet?.hasPhoto && !removePhoto)" class="account-button ml-2 mt-3" type="button" @click="clearPhoto"><Trash2 :size="16" aria-hidden="true" />Remove photo</button>
            <p :id="`${id}-photo-help`" class="mt-2 text-xs" :class="photoError ? 'account-error' : 'account-muted'" :role="photoError ? 'alert' : undefined">{{ photoError || 'JPEG, PNG or WebP · up to 5 MB. Illustration shown until you add a photo.' }}</p>
            <button v-if="photoError" class="account-link mt-2 text-xs" type="button" @click="dismissPhotoError">{{ photoFile || (pet?.hasPhoto && !removePhoto) ? 'Keep the current photo' : 'Continue without a photo' }}</button>
          </div>
        </div>
        <div><label class="account-field" :for="`${id}-nickname`">Pet nickname</label><input :id="`${id}-nickname`" v-model="form.nickname" class="account-input" :class="errors.nickname ? '!border-red-300 !bg-red-50' : ''" :aria-invalid="Boolean(errors.nickname)" :aria-describedby="`${id}-nickname-help`" autocomplete="off" maxlength="60" placeholder="For example, Luna" required @input="errors.nickname && (errors.nickname = '')" /><p :id="`${id}-nickname-help`" class="mt-2 text-xs" :class="errors.nickname ? 'account-error' : 'account-muted'">{{ errors.nickname || 'The name you use every day. Up to 60 characters.' }}</p></div>
        <div><AccountPetBreedPicker v-model="form.breedId" :error="errors.breedId" :disabled="saving" /><label class="mt-3 flex min-h-11 items-center gap-3 text-sm"><input v-model="form.isMixed" type="checkbox" class="h-4 w-4 accent-[var(--account-green)]" />Mixed breed</label><p class="account-muted text-xs">Choose a known breed and tick Mixed breed if it applies. Not sure is always an option.</p></div>
        <AccountPetChoices v-model="form.lifeStage" label="Life stage" :options="PET_LIFE_STAGES" />
        <div class="space-y-4"><AccountPetChoices v-model="form.sizeBand" label="Size" :options="sizeOptions" /><p class="account-muted text-xs">Approximate size guide only. Build and breed vary; choose the size that fits your pet.</p>
          <div><label class="account-field !flex items-center gap-2" :for="`${id}-weight`"><Scale :size="17" aria-hidden="true" />Current weight <span class="account-muted font-normal">(optional)</span></label><div class="mt-2 grid grid-cols-[minmax(0,1fr)_110px] gap-3"><input :id="`${id}-weight`" v-model="form.weight" class="account-input !mt-0" :class="errors.weight ? '!border-red-300 !bg-red-50' : ''" inputmode="decimal" type="text" maxlength="8" :placeholder="form.weightUnit === 'KG' ? 'For example, 12.5' : 'For example, 28'" :aria-invalid="Boolean(errors.weight)" :aria-describedby="`${id}-weight-help`" @input="delete errors.weight" /><label class="sr-only" :for="`${id}-weight-unit`">Weight unit</label><select :id="`${id}-weight-unit`" :value="form.weightUnit" class="account-input !mt-0" aria-label="Weight unit" @change="changeWeightUnit"><option value="LB">lb</option><option value="KG">kg</option></select></div><p :id="`${id}-weight-help`" class="mt-2 text-xs" :class="errors.weight ? 'account-error' : 'account-muted'">{{ errors.weight || 'Approximate is fine. Update it as they grow, or leave it empty. Weight does not change their selected size.' }}</p></div>
        </div>
        <fieldset><legend class="account-field">Favourite proteins <span class="account-muted font-normal">(optional)</span></legend><div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"><label v-for="option in PET_PROTEINS" :key="option.value" class="flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm" :class="form.proteinPreferences.includes(option.value) ? 'border-[var(--account-green)] bg-[var(--account-soft)]' : 'border-[var(--account-action-line)]'"><input v-model="form.proteinPreferences" type="checkbox" :value="option.value" class="h-4 w-4 shrink-0 accent-[var(--account-green)]" />{{ option.label }}</label></div><p class="account-muted mt-2 text-xs">Preferences only, not an allergy record or feeding recommendation.</p></fieldset>
        <fieldset><legend class="account-field">What are treats for? <span class="account-muted font-normal">(optional)</span></legend><p class="account-muted mt-2 text-xs">Choose as many as you like.</p><div class="mt-3 grid gap-2 sm:grid-cols-2"><label v-for="option in purposes" :key="option.value" class="flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm" :class="form.treatPurposes.includes(option.value) ? 'border-[var(--account-green)] bg-[var(--account-soft)]' : 'border-[var(--account-action-line)]'"><input v-model="form.treatPurposes" type="checkbox" :value="option.value" class="h-4 w-4 shrink-0 accent-[var(--account-green)]" />{{ option.label }}</label></div></fieldset>
        <fieldset class="border-t border-[var(--account-line)] pt-6"><legend class="account-field !flex items-center gap-2 pr-3"><CakeSlice :size="18" aria-hidden="true" />Birthday <span class="account-muted font-normal">(optional)</span></legend>
          <div v-if="locked" class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md bg-[var(--account-soft)] p-4"><span class="text-sm">{{ petBirthdayLabel(pet) }}</span><span class="account-muted flex items-center gap-2 text-xs"><LockKeyhole :size="15" aria-hidden="true" />Saved birthday · cannot be changed</span></div>
          <template v-else><p class="account-muted mt-2 text-sm">Month and day only. Check carefully: once saved, this birthday cannot be changed.</p><div class="mt-3 grid grid-cols-2 gap-3"><label class="account-field" :for="`${id}-month`">Month<select :id="`${id}-month`" v-model="form.birthdayMonth" class="account-input" :class="errors.birthday ? '!border-red-300 !bg-red-50' : ''" :aria-invalid="Boolean(errors.birthday)" :aria-describedby="`${id}-birthday-help`"><option value="">Not added</option><option v-for="month in PET_MONTHS" :key="month.value" :value="month.value">{{ month.label }}</option></select></label><label class="account-field" :for="`${id}-day`">Day<select :id="`${id}-day`" v-model="form.birthdayDay" class="account-input" :class="errors.birthday ? '!border-red-300 !bg-red-50' : ''" :aria-invalid="Boolean(errors.birthday)" :aria-describedby="`${id}-birthday-help`"><option value="">Not added</option><option v-for="day in days" :key="day" :value="day">{{ day }}</option></select></label></div><label v-if="form.birthdayMonth || form.birthdayDay" class="mt-3 flex min-h-11 items-start gap-3 text-sm"><input v-model="confirmed" type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-[var(--account-green)]" />I confirm this birthday is correct and understand it cannot be changed.</label><p :id="`${id}-birthday-help`" class="mt-2 text-xs" :class="errors.birthday ? 'account-error' : 'account-muted'">{{ errors.birthday || 'Leave both fields empty if you do not want to share a birthday.' }}</p></template>
        </fieldset>
      </fieldset>
      <p v-if="error" role="alert" class="account-error mt-5 rounded-md border border-red-200 bg-red-50 p-3">{{ error }}</p>
      <p v-if="Object.keys(errors).length" role="alert" class="account-error mt-4">Check the highlighted fields before saving.</p>
      <div class="mt-7 flex flex-wrap justify-end gap-3 border-t border-[var(--account-line)] pt-5"><button type="button" class="account-button" :disabled="saving" @click="emit('close')">Cancel</button><button type="submit" class="account-button account-button--primary" :disabled="saving"><Save :size="17" aria-hidden="true" />{{ saving ? 'Saving...' : 'Save pet details' }}</button></div>
    </form>
  </section>
</template>
