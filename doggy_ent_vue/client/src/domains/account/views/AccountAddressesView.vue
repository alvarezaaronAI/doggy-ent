<template>
  <header class="account-heading">
    <h1>Your addresses</h1>
    <p>A familiar place for your next delivery.</p>
  </header>
  <p v-if="loading" role="status" class="account-muted mb-5">Loading your address...</p>
  <p v-if="error && !section" role="alert" class="account-error mb-5">
    {{ error }} <button type="button" class="account-link" @click="loadProfile">Try again</button>
  </p>
  <p v-if="notice" role="status" class="account-notice mb-5">{{ notice }}</p>
  <section v-if="profile" class="account-section">
    <div class="account-row">
      <h2>Default shipping address</h2>
      <button
        class="account-button"
        :disabled="loading"
        type="button"
        @click="openEditor('address')"
      >
        <i class="fa-solid fa-pen" aria-hidden="true"></i
        >{{ hasAddress ? 'Edit address' : 'Add address' }}
      </button>
    </div>
    <div v-if="hasAddress" class="mt-5">
      <p class="font-semibold">{{ profile.name }}</p>
      <p v-for="(line, index) in lines" :key="index" class="account-muted">{{ line }}</p>
      <p class="mt-4 text-sm account-muted">
        Used to prefill your next checkout. You can still choose a different address there.
      </p>
    </div>
    <p v-else class="account-empty">No shipping address saved yet.</p>
  </section>
  <section class="account-section">
    <h2>More places, less typing</h2>
    <p class="account-muted mt-3">
      Coming in future phase: multiple saved addresses and a separate default billing address.
    </p>
  </section>
  <AccountProfileEditor
    v-if="section && profile"
    :profile="profile"
    :section="section"
    :saving="saving"
    :error="error"
    @close="section = ''"
    @save="saveEditor"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AccountProfileEditor from '../components/AccountProfileEditor.vue'
import { useAccountProfileEditor } from '../composables/useAccountProfileEditor.js'
import { addressLines } from '../utils/accountFormatting.js'
const { profile, loading, saving, error, section, notice, openEditor, saveEditor, loadProfile } =
  useAccountProfileEditor()
const hasAddress = computed(() => Boolean(profile.value?.profile?.defaultAddress?.address1))
const lines = computed(() => addressLines(profile.value?.profile?.defaultAddress))
onMounted(loadProfile)
</script>
