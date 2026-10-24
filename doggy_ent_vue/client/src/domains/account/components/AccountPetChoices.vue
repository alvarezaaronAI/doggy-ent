<script setup>
import { Baby, Dog, Heart, PawPrint } from '@lucide/vue'
import { useId } from 'vue'
defineProps({ label: { type: String, required: true }, options: { type: Array, required: true }, modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const id = useId(), icons = { baby: Baby, dog: Dog, heart: Heart, paw: PawPrint }
</script>
<template>
  <fieldset><legend class="account-field">{{ label }} <span class="account-muted font-normal">(optional)</span></legend><div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><label v-for="(option, index) in options" :key="option.value" class="flex min-h-[86px] min-w-0 flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--account-green)]" :class="modelValue === option.value ? 'border-[var(--account-green)] bg-[var(--account-soft)] text-[var(--account-green)]' : 'border-[var(--account-action-line)] bg-white'">
      <input type="radio" class="sr-only" :name="id" :value="option.value" :aria-label="option.label" :aria-describedby="option.hint ? `${id}-hint-${index}` : undefined" :checked="modelValue === option.value" @change="emit('update:modelValue', option.value)" /><component :is="icons[option.icon] || PawPrint" :size="option.icon === 'dog' ? 18 + index * 3 : 22" class="shrink-0" aria-hidden="true" /><span>{{ option.label }}</span><span v-if="option.hint" :id="`${id}-hint-${index}`" class="account-muted text-center text-xs">{{ option.hint }}</span>
    </label></div><button v-if="modelValue" type="button" class="account-link mt-2 !min-h-9 !text-xs" @click="emit('update:modelValue', '')">Clear {{ label.toLowerCase() }}</button></fieldset>
</template>
