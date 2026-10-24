<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Package, ShieldCheck } from '@lucide/vue'
import AccountShell from '../components/AccountShell.vue'
import AccountPasswordField from '../components/AccountPasswordField.vue'
import AccountTextField from '../components/AccountTextField.vue'
import AccountFormErrors from '../components/AccountFormErrors.vue'
import { useAccountEntry } from '../composables/useAccountEntry.js'
import { accountRedirectQuery, safeAccountReturn } from '../utils/accountNavigation.js'
const route = useRoute(), router = useRouter()
const redirectQuery = computed(() => accountRedirectQuery(route.query.redirect))
const checkout = computed(() => safeAccountReturn(route.query.redirect) === '/checkout')
const { form, message, loading, errors, fieldStates, credentialsRejected, touch, submit } = useAccountEntry({ redirect: route.query.redirect, onSuccess: target => router.replace(target) })
const summary = ref(null)
async function submitForm() { await submit(); await nextTick(); summary.value?.focus() }
</script>
<template>
  <AccountShell title="Welcome back" subtitle="Your orders, your details, and a little less typing next time." :show-nav="false" :back-to="checkout ? '/checkout' : '/#shop'" :back-label="checkout ? 'Back to checkout' : 'Back to the shop'">
    <form novalidate class="space-y-5" :aria-busy="loading" @submit.prevent="submitForm">
      <AccountFormErrors ref="summary" :message="message" :errors="errors" :fields="{ email: 'signin-email', password: 'signin-password' }" />
      <fieldset :disabled="loading" class="space-y-5">
        <AccountTextField id="signin-email" v-model="form.email" name="email" label="Email address" type="email" autocomplete="username" placeholder="you@example.com" hint="Use the email address you created your account with." :error="errors.email" :valid="fieldStates.email === 'valid'" :invalid="credentialsRejected" @blur="touch('email')" />
        <AccountPasswordField id="signin-password" v-model="form.password" hint="Your password is case-sensitive." :error="errors.password" :invalid="credentialsRejected" @blur="touch('password')" />
      </fieldset>
      <div class="flex justify-end"><RouterLink class="auth-link" :to="{ path: '/account/forgot-password', query: redirectQuery }">Forgot your password?</RouterLink></div>
      <button class="auth-primary" type="submit" :disabled="loading">{{ loading ? 'Signing you in...' : checkout ? 'Sign in & return to checkout' : 'Sign in' }}<ArrowRight v-if="!loading" :size="18" aria-hidden="true" /></button>
    </form>
    <div class="mt-6 border-t border-stone-200 pt-4 text-center"><p class="text-sm text-stone-600">New to Chase &amp; Evie?</p><RouterLink class="auth-link" :to="{ path: '/account/create', query: redirectQuery }">Create an account</RouterLink></div>
    <div class="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-stone-100 pt-5 text-xs text-stone-600"><span class="inline-flex items-center gap-2"><Package :size="16" aria-hidden="true" />Order history</span><span class="inline-flex items-center gap-2"><ShieldCheck :size="16" aria-hidden="true" />Your bag stays with you</span></div>
    <p class="auth-hint mt-4 text-center"><RouterLink :to="checkout ? '/checkout' : '/#shop'" class="underline underline-offset-4">{{ checkout ? 'Continue as a guest' : 'Keep shopping' }}</RouterLink>. An account is always optional.</p>
  </AccountShell>
</template>
