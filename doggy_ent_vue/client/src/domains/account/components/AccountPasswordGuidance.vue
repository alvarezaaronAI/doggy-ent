<script setup>
import { Check, Circle } from '@lucide/vue'
defineProps({ password: { type: String, default: '' }, confirmation: { type: String, default: '' } })
</script>
<template>
  <ul class="auth-password-guidance" aria-label="Password requirements">
    <li :class="{ 'is-met': password.length >= 8 && password.length <= 128 }"><Check v-if="password.length >= 8 && password.length <= 128" :size="15" aria-hidden="true" /><Circle v-else :size="15" aria-hidden="true" /><span><span class="sr-only">{{ password.length >= 8 && password.length <= 128 ? 'Met: ' : 'Not yet met: ' }}</span>8 to 128 characters</span></li>
    <li :class="{ 'is-met': Boolean(confirmation) && password === confirmation }"><Check v-if="confirmation && password === confirmation" :size="15" aria-hidden="true" /><Circle v-else :size="15" aria-hidden="true" /><span><span class="sr-only">{{ confirmation && password === confirmation ? 'Met: ' : 'Not yet met: ' }}</span>Passwords match</span></li>
  </ul>
</template>
