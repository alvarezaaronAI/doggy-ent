<template>
  <header class="account-heading">
    <h1>Your profile</h1>
    <p>The essentials, all in one place.</p>
  </header>
  <p v-if="loading" role="status" class="account-muted mb-5">Loading your profile...</p>
  <p v-if="error && !section" role="alert" class="account-error mb-5">
    {{ error }} <button class="account-link" type="button" @click="loadProfile">Try again</button>
  </p>
  <p v-if="notice" role="status" class="account-notice mb-5">{{ notice }}</p>
  <template v-if="profile">
    <section class="account-section">
      <div class="account-row">
        <h2>Personal details</h2>
        <button
          class="account-button"
          type="button"
          :disabled="loading"
          @click="openEditor('personal')"
        >
          <i class="fa-solid fa-pen" aria-hidden="true"></i>Edit details
        </button>
      </div>
      <dl class="account-summary-grid mt-6">
        <div>
          <dt>Name</dt>
          <dd>
            {{
              [profile.profile?.firstName, profile.profile?.lastName].filter(Boolean).join(' ') ||
              profile.name
            }}
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{{ profile.profile?.phone || 'Not added yet' }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{{ profile.email }}</dd>
        </div>
        <div>
          <dt>Email verification</dt>
          <dd class="flex items-center gap-2">
            <i
              class="fa-solid"
              :class="
                profile.emailVerified ? 'fa-circle-check text-[var(--account-green)]' : 'fa-clock'
              "
              aria-hidden="true"
            ></i
            >{{ profile.emailVerified ? 'Verified' : 'Not verified yet' }}
          </dd>
        </div>
      </dl>
      <p class="account-muted mt-5 text-xs">
        Your email is your sign-in address. Email changes are not available yet.
      </p>
    </section>
    <section class="account-section">
      <div class="account-row">
        <h2>Communication preferences</h2>
        <button
          class="account-button"
          type="button"
          :disabled="loading"
          @click="openEditor('preferences')"
        >
          <i class="fa-solid fa-sliders" aria-hidden="true"></i>Edit preferences
        </button>
      </div>
      <p class="mt-4">
        {{
          profile.profile?.marketingOptIn
            ? 'You are opted in to offers and product news.'
            : 'You are opted out of offers and product news.'
        }}
      </p>
      <p class="account-muted mt-2 text-sm">
        Essential account and security messages are separate from marketing.
      </p>
    </section>
    <section class="account-section">
      <div class="account-row">
        <div>
          <h2>Sign-in &amp; security</h2>
          <p class="account-muted mt-2 text-sm">Keep your account details safe.</p>
        </div>
        <RouterLink to="/account/forgot-password" class="account-button"
          ><i class="fa-solid fa-lock" aria-hidden="true"></i>Reset password</RouterLink
        >
      </div>
    </section>
  </template>
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
import { onMounted } from 'vue'
import AccountProfileEditor from '../components/AccountProfileEditor.vue'
import { useAccountProfileEditor } from '../composables/useAccountProfileEditor.js'
const { profile, loading, saving, error, section, notice, openEditor, saveEditor, loadProfile } =
  useAccountProfileEditor()
onMounted(loadProfile)
</script>
