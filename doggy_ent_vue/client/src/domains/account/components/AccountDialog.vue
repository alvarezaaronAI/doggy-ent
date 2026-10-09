<template>
  <Teleport to="body">
    <div class="account-ui account-dialog-backdrop" @click.self="requestClose" @keydown="onKeydown">
      <section
        ref="dialog"
        class="account-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <div class="account-row mb-5">
          <h2 :id="titleId">{{ title }}</h2>
          <button
            type="button"
            class="account-icon-button"
            title="Close"
            aria-label="Close dialog"
            :disabled="busy"
            @click="requestClose"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
const props = defineProps({ title: { type: String, required: true }, busy: Boolean })
const emit = defineEmits(['close'])
const dialog = ref(null)
const titleId = useId()
let opener, previousOverflow
function requestClose() {
  if (!props.busy) emit('close')
}
function focusable() {
  return [
    ...dialog.value.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]'
    ),
  ].filter((element) => element.getClientRects().length)
}
function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
  }
  if (event.key !== 'Tab') return
  const elements = focusable()
  const first = elements[0],
    last = elements.at(-1)
  if (!elements.length) {
    event.preventDefault()
    dialog.value.focus()
    return
  }
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === dialog.value)
  ) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
onMounted(async () => {
  opener = document.activeElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  const initial = dialog.value.querySelector('input, select, textarea') || dialog.value
  initial.focus()
})
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  if (opener?.isConnected) opener.focus()
})
</script>
