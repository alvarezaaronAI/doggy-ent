import { nextTick, onBeforeUnmount, onMounted, onUpdated, watch } from 'vue'

export function useCartDrawerDialog({ isOpen, dialog, close }) {
  let opener
  let previousOverflow
  let active = false

  function focusable() {
    return [
      ...(dialog.value?.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      ) || []),
    ].filter((element) => element.getClientRects().length)
  }

  function keepFocus(event) {
    if (isOpen() && !dialog.value?.contains(event.target)) {
      focusInitial()
    }
  }

  function focusInitial() {
    const target = focusable()[0] || dialog.value
    target?.focus({ preventScroll: true })
  }

  function onKeydown(event) {
    if (!isOpen()) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const elements = focusable()
    const first = elements[0]
    const last = elements.at(-1)
    if (!first) {
      event.preventDefault()
      dialog.value?.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function activate() {
    if (active || typeof document === 'undefined') return
    active = true
    opener = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    if (!active || !isOpen()) return
    dialog.value?.scrollTo?.({ top: 0 })
    document.addEventListener('focusin', keepFocus)
    focusInitial()
  }

  function deactivate(restoreFocus = true) {
    if (!active) return
    active = false
    document.removeEventListener('focusin', keepFocus)
    document.body.style.overflow = previousOverflow
    if (restoreFocus) {
      const target =
        opener?.isConnected && !opener.closest?.('[inert]')
          ? opener
          : document.querySelector('[aria-controls="cart-drawer"]')
      target?.focus?.({ preventScroll: true })
    }
  }

  watch(isOpen, (open) => (open ? activate() : deactivate()), { flush: 'post' })
  onMounted(() => {
    if (isOpen()) activate()
  })
  onUpdated(() => {
    if (active && isOpen() && !dialog.value?.contains(document.activeElement)) {
      focusInitial()
    }
  })
  onBeforeUnmount(() => deactivate(false))
  return { onKeydown }
}
