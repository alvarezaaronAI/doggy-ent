<script setup>
import CommerceDialog from '@shared/components/CommerceDialog.vue'
import { ShieldCheck, ArrowLeft, Check } from '@lucide/vue'
import { useCheckoutAuth } from '../composables/useCheckoutAuth.js'
const props = defineProps({ mode: { type: String, default: 'sign-in' }, customer: { type: Object, default: () => ({}) } })
const emit = defineEmits(['authenticated', 'close'])
const { form, creating, review, message, loading, switchMode, submit } = useCheckoutAuth(props.mode, props.customer, details => emit('authenticated', details))
</script>
<template>
  <CommerceDialog :title="review ? 'Confirm your account details' : creating ? 'Create your account' : 'Welcome back'" :busy="loading" @close="emit('close')">
    <form class="space-y-5 p-6" @submit.prevent="submit">
      <p class="text-sm leading-relaxed text-stone-600">{{ review ? 'Check your details before creating your account. Your checkout and bag stay right here.' : 'Faster checkout, order history, and a familiar place to come back to. Guest checkout is always available.' }}</p>
      <fieldset v-if="!review" :disabled="loading" class="space-y-4">
        <div v-if="creating" class="grid grid-cols-2 gap-3">
          <label class="text-sm font-semibold">First name<input v-model="form.firstName" autocomplete="given-name" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3" /></label>
          <label class="text-sm font-semibold">Last name<input v-model="form.lastName" autocomplete="family-name" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3" /></label>
        </div>
        <label class="block text-sm font-semibold">Email address<input v-model="form.email" type="email" autocomplete="email" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3" /></label>
        <label class="block text-sm font-semibold">Password<input v-model="form.password" type="password" :autocomplete="creating ? 'new-password' : 'current-password'" :minlength="creating ? 8 : undefined" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3" /></label>
        <label v-if="creating" class="block text-sm font-semibold">Confirm password<input v-model="form.confirmPassword" type="password" autocomplete="new-password" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3" /></label>
      </fieldset>
      <div v-else class="space-y-4 border-y border-stone-200 py-5">
        <div><p class="text-xs text-stone-500">Account name</p><p class="font-semibold">{{ form.firstName }} {{ form.lastName }}</p></div>
        <div><p class="text-xs text-stone-500">Account email</p><p class="break-words font-semibold">{{ form.email.trim().toLowerCase() }}</p></div>
        <p class="text-sm text-stone-600">Your shipping address and phone stay in checkout. They are not added to your profile without a separate save.</p>
        <p class="flex gap-2 text-sm text-[#17634c]"><ShieldCheck :size="18" class="shrink-0" />You will be signed in here after creating your account. No order or payment is placed yet.</p>
        <button type="button" class="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-3 py-2" :disabled="loading" @click="review = false"><ArrowLeft :size="16" />Edit details</button>
      </div>
      <p v-if="message" class="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{{ message }}</p>
      <button type="submit" class="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#f2de5c] px-4 py-3 font-semibold text-[#6a3c2b] disabled:opacity-50" :disabled="loading"><Check v-if="review" :size="18" />{{ loading ? 'Connecting your account...' : review ? 'Confirm & create account' : creating ? 'Review account details' : 'Sign in & continue checkout' }}</button>
      <div class="flex flex-wrap justify-between gap-3 text-sm">
        <button type="button" class="font-semibold text-[#315bc5]" :disabled="loading" @click="switchMode(creating ? 'sign-in' : 'create')">{{ creating ? 'Sign in instead' : 'Create an account' }}</button>
        <button type="button" class="text-stone-600 underline" :disabled="loading" @click="emit('close')">Continue as guest</button>
      </div>
    </form>
  </CommerceDialog>
</template>
