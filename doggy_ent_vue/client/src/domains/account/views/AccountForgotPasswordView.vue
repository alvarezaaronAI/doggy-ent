<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Mail, ArrowLeft } from '@lucide/vue'
import AccountShell from '../components/AccountShell.vue'
import AccountTextField from '../components/AccountTextField.vue'
import AccountFormErrors from '../components/AccountFormErrors.vue'
import { useAccountRecovery } from '../composables/useAccountRecovery.js'
import { accountRedirectQuery } from '../utils/accountNavigation.js'
const route = useRoute()
const redirectQuery = computed(() => accountRedirectQuery(route.query.redirect))
const { email, busy, message, complete, checking, resetAvailable, emailErrors, emailStates, touchEmail, loadReadiness, requestReset } = useAccountRecovery({ redirect: route.query.redirect, origin: globalThis.location?.origin || '' })
const summary = ref(null)
async function submitForm() { await requestReset(); await nextTick(); summary.value?.focus() }
onMounted(loadReadiness)
</script>
<template>
  <AccountShell title="Let's get you back in" subtitle="Enter your sign-in email to request a secure password reset link." :show-nav="false">
    <div v-if="complete" class="auth-success" role="status"><Mail :size="26" class="mb-3" aria-hidden="true" /><h2 class="text-lg font-semibold">Request received</h2><p class="mt-2 text-sm leading-relaxed">If an account uses that email, we will try to send a reset link. Check your inbox and spam folder. For your privacy, we do not confirm whether an account exists.</p><p class="auth-hint mt-3">Your password has not changed. If nothing arrives after a few minutes, try again or <RouterLink to="/contact" class="underline">contact us for help</RouterLink>.</p></div>
    <template v-else>
      <p v-if="checking" class="auth-hint mb-4" role="status">Checking email recovery...</p>
      <div v-if="resetAvailable === false" class="auth-alert mb-5" role="status">Password reset email is not available right now. <RouterLink to="/contact" class="underline">Contact us for help</RouterLink>. Your account and bag have not changed.</div>
      <form novalidate :aria-busy="busy" class="space-y-5" @submit.prevent="submitForm">
        <AccountFormErrors ref="summary" :message="message" :errors="emailErrors" :fields="{ email: 'recovery-email' }" />
        <AccountTextField id="recovery-email" v-model="email" label="Email address" name="email" type="email" autocomplete="username" placeholder="you@example.com" hint="Use the email address you normally sign in with." :error="emailErrors.email" :valid="emailStates.email === 'valid'" :disabled="busy || resetAvailable !== true" @blur="touchEmail('email')" />
        <button class="auth-primary" type="submit" :disabled="busy || resetAvailable !== true">{{ busy ? 'Requesting your link...' : 'Send reset link' }}</button>
      </form>
      <button v-if="resetAvailable === null && !checking" class="auth-link mt-3" type="button" @click="loadReadiness">Try again</button>
    </template>
    <RouterLink class="auth-link mt-5" :to="{ path: '/account/sign-in', query: redirectQuery }"><ArrowLeft :size="16" aria-hidden="true" />Back to sign in</RouterLink>
  </AccountShell>
</template>
