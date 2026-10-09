<template>
  <span class="account-status" :class="`account-status--${display.tone}`">
    <i :class="['fa-solid', display.icon]" aria-hidden="true"></i>{{ display.label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { ORDER_STATUS_DISPLAY } from '../constants/account.constants.js'
import { formatAccountLabel } from '../utils/accountFormatting.js'
const props = defineProps({ status: { type: String, default: 'PENDING' } })
const display = computed(
  () =>
    ORDER_STATUS_DISPLAY[props.status] || {
      label: formatAccountLabel(props.status),
      icon: 'fa-comment',
      tone: 'neutral',
    }
)
</script>
