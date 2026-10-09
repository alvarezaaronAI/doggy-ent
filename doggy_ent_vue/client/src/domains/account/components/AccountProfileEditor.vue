<template>
  <AccountDialog :title="title" :busy="saving" @close="$emit('close')">
    <form @submit.prevent="submit">
      <div v-if="section === 'personal'" class="grid gap-4 sm:grid-cols-2">
        <label class="account-field"
          >First name<input
            v-model="form.firstName"
            class="account-input"
            autocomplete="given-name"
            maxlength="100"
            required
        /></label>
        <label class="account-field"
          >Last name<input
            v-model="form.lastName"
            class="account-input"
            autocomplete="family-name"
            maxlength="100"
            required
        /></label>
        <label class="account-field sm:col-span-2"
          >Phone number<input
            v-model="form.phone"
            class="account-input"
            type="tel"
            autocomplete="tel"
            maxlength="40"
        /></label>
      </div>
      <div v-else-if="section === 'address'" class="grid gap-4 sm:grid-cols-2">
        <label class="account-field sm:col-span-2"
          >Street address<input
            v-model="form.defaultAddress.address1"
            class="account-input"
            autocomplete="address-line1"
            maxlength="200"
            required
        /></label>
        <label class="account-field sm:col-span-2"
          >Apartment, suite, etc. (optional)<input
            v-model="form.defaultAddress.address2"
            class="account-input"
            autocomplete="address-line2"
            maxlength="200"
        /></label>
        <label class="account-field"
          >City<input
            v-model="form.defaultAddress.city"
            class="account-input"
            autocomplete="address-level2"
            maxlength="100"
            required
        /></label>
        <label class="account-field"
          >State / region<input
            v-model="form.defaultAddress.state"
            class="account-input"
            autocomplete="address-level1"
            maxlength="100"
            required
        /></label>
        <label class="account-field"
          >Postal code<input
            v-model="form.defaultAddress.zip"
            class="account-input"
            autocomplete="postal-code"
            maxlength="20"
            required
        /></label>
        <label class="account-field"
          >Country code<input
            v-model="form.defaultAddress.country"
            class="account-input uppercase"
            autocomplete="country"
            minlength="2"
            maxlength="2"
            required
        /></label>
      </div>
      <div v-else class="space-y-5">
        <p class="account-muted text-sm">
          Choose the updates you would like to receive. Rewards and referrals are coming in a future
          phase.
        </p>
        <label
          v-for="field in NOTIFICATION_FIELDS"
          :key="field.key"
          class="flex items-center gap-3 text-sm"
          ><input
            v-model="form.notificationPreference[field.key]"
            type="checkbox"
            class="h-4 w-4 accent-[var(--account-green)]"
          />{{ field.label }}</label
        >
        <label class="flex items-center gap-3 border-t border-[var(--account-line)] pt-5 text-sm"
          ><input
            v-model="form.marketingOptIn"
            type="checkbox"
            class="h-4 w-4 accent-[var(--account-green)]"
          />Email me occasional offers and product news</label
        >
        <p class="account-muted text-xs">
          Uncheck offers and product news to opt out. Essential account and security messages are
          separate.
        </p>
      </div>
      <p v-if="validation || error" role="alert" class="account-error mt-4">
        {{ validation || error }}
      </p>
      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <button class="account-button" type="button" :disabled="saving" @click="$emit('close')">
          Cancel
        </button>
        <button class="account-button account-button--primary" :disabled="saving" type="submit">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </form>
  </AccountDialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AccountDialog from './AccountDialog.vue'
import { NOTIFICATION_FIELDS } from '../constants/account.constants.js'
import { toAccountProfileForm } from '../mappers/accountProfile.mapper.js'
import { validateAccountAddress, validateProfileForm } from '../validators/account.validators.js'
const props = defineProps({
  profile: { type: Object, required: true },
  section: { type: String, required: true },
  saving: Boolean,
  error: { type: String, default: '' },
})
const emit = defineEmits(['save', 'close'])
const form = reactive(toAccountProfileForm(props.profile))
const validation = ref('')
const title = computed(
  () =>
    ({
      personal: 'Edit personal details',
      address: 'Edit shipping address',
      preferences: 'Communication preferences',
    })[props.section]
)
function submit() {
  validation.value =
    props.section === 'personal'
      ? validateProfileForm(form)
      : props.section === 'address'
        ? validateAccountAddress(form.defaultAddress)
        : ''
  if (!validation.value) emit('save', form)
}
</script>
