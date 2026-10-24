<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from '@lucide/vue'
import AccountShell from '../components/AccountShell.vue'
import AccountPasswordField from '../components/AccountPasswordField.vue'
import AccountTextField from '../components/AccountTextField.vue'
import AccountFormErrors from '../components/AccountFormErrors.vue'
import AccountPasswordGuidance from '../components/AccountPasswordGuidance.vue'
import { useAccountEntry } from '../composables/useAccountEntry.js'
import { accountRedirectQuery, safeAccountReturn } from '../utils/accountNavigation.js'
const route = useRoute(), router = useRouter()
const redirectQuery = computed(() => accountRedirectQuery(route.query.redirect))
const checkout = computed(() => safeAccountReturn(route.query.redirect) === '/checkout')
const { form, review, message, loading, accountCreated, errors, fieldStates, touch, submit, edit } = useAccountEntry({ creating: true, redirect: route.query.redirect, onSuccess: target => router.replace(target) })
const summary = ref(null)
async function submitForm() { await submit(); await nextTick(); summary.value?.focus() }
</script>
<template>
  <AccountShell :title="accountCreated ? 'Your account is created' : review ? 'Check your details' : 'Make yourself at home'" :subtitle="review ? 'One last look before we create your account.' : 'A little less typing next time. Your orders and details, together.'" :show-nav="false" :back-to="checkout ? '/checkout' : '/#shop'" :back-label="checkout ? 'Back to checkout' : 'Back to the shop'">
    <ol v-if="!accountCreated" class="auth-progress" aria-label="Create account progress"><li :aria-current="!review ? 'step' : undefined" :class="{ 'is-current': !review }"><span>1</span>Your details</li><li :aria-current="review ? 'step' : undefined" :class="{ 'is-current': review }"><span>2</span>Review &amp; create</li></ol>
    <form v-if="!accountCreated" novalidate class="space-y-5" :aria-busy="loading" @submit.prevent="submitForm">
      <AccountFormErrors ref="summary" :message="message" :errors="errors" :fields="{ name: 'create-name', email: 'create-email', password: 'create-password', confirmPassword: 'create-confirm-password' }" />
      <fieldset v-if="!review" :disabled="loading" class="space-y-5">
        <AccountTextField id="create-name" v-model="form.name" name="name" label="Full name" autocomplete="name" placeholder="Alex Morgan" hint="The name you would like us to use. One name is fine." :maxlength="100" :error="errors.name" :valid="fieldStates.name === 'valid'" @blur="touch('name')" />
        <AccountTextField id="create-email" v-model="form.email" name="email" label="Email address" type="email" autocomplete="username" placeholder="you@example.com" hint="You will use this email to sign in and recover your account." :error="errors.email" :valid="fieldStates.email === 'valid'" @blur="touch('email')" />
        <AccountPasswordField id="create-password" v-model="form.password" autocomplete="new-password" placeholder="Create a password" hint="Use a unique passphrase. Password managers and paste work here." :error="errors.password" :valid="fieldStates.password === 'valid'" @blur="touch('password')" />
        <AccountPasswordField id="create-confirm-password" v-model="form.confirmPassword" label="Confirm password" autocomplete="new-password" placeholder="Repeat your password" hint="Enter it again so we can check for typing mistakes." :error="errors.confirmPassword" :valid="fieldStates.confirmPassword === 'valid'" @blur="touch('confirmPassword')" />
        <AccountPasswordGuidance :password="form.password" :confirmation="form.confirmPassword" />
      </fieldset>
      <div v-else class="space-y-5">
        <dl class="divide-y divide-stone-200 border-y border-stone-200"><div class="py-4"><dt class="auth-hint">Full name</dt><dd class="mt-1 break-words font-semibold">{{ form.name.trim() }}</dd></div><div class="py-4"><dt class="auth-hint">Sign-in email</dt><dd class="mt-1 break-words font-semibold">{{ form.email }}</dd></div></dl>
        <p class="flex items-start gap-2 text-sm text-stone-600"><ShieldCheck :size="18" class="shrink-0" aria-hidden="true" />Your password stays private. No order is placed, and your bag is unchanged.</p>
        <button class="auth-link" type="button" :disabled="loading" @click="edit"><ArrowLeft :size="16" aria-hidden="true" />Edit details</button>
      </div>
      <button class="auth-primary" type="submit" :disabled="loading"><Check v-if="review && !loading" :size="18" aria-hidden="true" />{{ loading ? 'Creating your account...' : review ? 'Confirm & create account' : 'Review your details' }}<ArrowRight v-if="!review" :size="18" aria-hidden="true" /></button>
    </form>
    <p v-else class="auth-alert" role="status">{{ message }}</p>
    <p class="auth-hint mt-5">Your account does not sign you up for marketing. Read our <RouterLink to="/privacy" class="underline underline-offset-4">privacy information</RouterLink>.</p>
    <div class="mt-6 border-t border-stone-200 pt-4 text-center"><p v-if="!accountCreated" class="text-sm text-stone-600">Already have an account?</p><RouterLink class="auth-link" :to="{ path: '/account/sign-in', query: redirectQuery }">{{ accountCreated ? 'Sign in to continue' : 'Sign in instead' }}</RouterLink></div>
  </AccountShell>
</template>
