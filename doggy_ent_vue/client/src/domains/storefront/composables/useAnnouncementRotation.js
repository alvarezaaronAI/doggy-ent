import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export function useAnnouncementRotation(messages, enabled) {
  const index = ref(0), paused = ref(false), reduced = ref(false)
  let timer, media
  function stop() { clearInterval(timer) }
  function schedule() {
    stop()
    if (typeof document === 'undefined' || document.hidden || reduced.value || paused.value || !enabled.value || messages.value.length < 2) return
    timer = setInterval(() => { index.value = (index.value + 1) % messages.value.length }, 5500)
  }
  function step(direction) {
    index.value = (index.value + direction + messages.value.length) % messages.value.length
    schedule()
  }
  function preference() { reduced.value = media.matches; schedule() }
  watch([messages, enabled], () => { index.value = Math.min(index.value, Math.max(0, messages.value.length - 1)); schedule() })
  watch(paused, schedule)
  onMounted(() => {
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference(); media.addEventListener('change', preference)
    document.addEventListener('visibilitychange', schedule)
  })
  onBeforeUnmount(() => { stop(); media?.removeEventListener('change', preference); document.removeEventListener('visibilitychange', schedule) })
  return { index, paused, reduced, current: computed(() => messages.value[index.value]), step }
}
