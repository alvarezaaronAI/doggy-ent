<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, ArrowRight } from '@lucide/vue'
import AccountShell from '../components/AccountShell.vue'
import AccountPasswordField from '../components/AccountPasswordField.vue'
import AccountFormErrors from '../components/AccountFormErrors.vue'
import AccountPasswordGuidance from '../components/AccountPasswordGuidance.vue'
import { useAccountRecovery } from '../composables/useAccountRecovery.js'
import { accountRedirectQuery } from '../utils/accountNavigation.js'
const route = useRoute(), router = useRouter()
const redirectQuery = computed(() => accountRedirectQuery(route.query.redirect))
const { form, busy, message, complete, validLink, passwordErrors, passwordStates, touchPassword, resetPassword } = useAccountRecovery({ token: route.query.token, invalidLink: Boolean(route.query.error), redirect: route.query.redirect })
const summary = ref(null)
async function submitForm() { await resetPassword(); await nextTick(); summary.value?.focus() }
onMounted(() => { if ('token' in route.query || 'error' in route.query) router.replace({ path: route.path, query: redirectQuery.value }) })
</script>
<template>
  <AccountShell :title="complete ? 'You are all set' : 'Choose a new password'" subtitle="Keep your account yours with a unique password." :show-nav="false">
    <div v-if="complete" class="auth-success" role="status"><Check :size="26" class="mb-3" aria-hidden="true" /><h2 class="text-lg font-semibold">Password updated</h2><p class="mt-2 text-sm leading-relaxed">Sign in with your new password to continue. Your previous sign-in sessions have been ended for security.</p></div>
    <div v-else-if="!validLink" class="auth-alert" role="status">This reset link is missing or no longer valid. <RouterLink class="underline" :to="{ path: '/account/forgot-password', query: redirectQuery }">Request a new link</RouterLink> to continue.</div>
    <form v-else novalidate :aria-busy="busy" class="space-y-5" @submit.prevent="submitForm">
      <AccountFormErrors ref="summary" :message="message" :errors="passwordErrors" :fields="{ password: 'reset-password', confirmPassword: 'reset-confirm-password' }" />
      <fieldset :disabled="busy" class="space-y-5"><AccountPasswordField id="reset-password" v-model="form.password" label="New password" autocomplete="new-password" placeholder="Create a password" hint="Use a unique passphrase. Password managers and paste work here." :error="passwordErrors.password" :valid="passwordStates.password === 'valid'" @blur="touchPassword('password')" /><AccountPasswordField id="reset-confirm-password" v-model="form.confirmPassword" label="Confirm new password" autocomplete="new-password" placeholder="Repeat your password" hint="Enter it again so we can check for typing mistakes." :error="passwordErrors.confirmPassword" :valid="passwordStates.confirmPassword === 'valid'" @blur="touchPassword('confirmPassword')" /><AccountPasswordGuidance :password="form.password" :confirmation="form.confirmPassword" /></fieldset>
      <button class="auth-primary" type="submit" :disabled="busy">{{ busy ? 'Updating your password...' : 'Save new password' }}</button>
      <RouterLink v-if="message" class="auth-link" :to="{ path: '/account/forgot-password', query: redirectQuery }">Request a fresh reset link</RouterLink>
    </form>
    <RouterLink class="auth-link mt-5" :to="{ path: '/account/sign-in', query: redirectQuery }">{{ complete ? 'Sign in with your new password' : 'Back to sign in' }}<ArrowRight :size="16" aria-hidden="true" /></RouterLink>
  </AccountShell>
</template>
