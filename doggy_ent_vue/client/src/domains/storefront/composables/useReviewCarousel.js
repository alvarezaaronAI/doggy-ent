import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export function useReviewCarousel(track, count, enabled) {
  const paused = ref(false)
  const reduced = ref(false)
  const overflowing = ref(false)
  const start = ref(1)
  const end = ref(1)
  const visible = ref(false)
  const hovering = ref(false)
  const focused = ref(false)
  let timer, media, resizeObserver, intersectionObserver

  function stop() {
    clearInterval(timer)
  }

  const rotating = computed(() => enabled.value && overflowing.value && visible.value
    && !paused.value && !reduced.value && !hovering.value && !focused.value)

  function schedule() {
    stop()
    if (rotating.value && !document.hidden) timer = setInterval(() => step(1, true), 8000)
  }

  function measure() {
    const element = track.value
    if (!element?.clientWidth) return
    overflowing.value = element.scrollWidth > element.clientWidth + 2
    const cards = [...element.children]
    const left = Math.max(0, element.scrollLeft)
    const stride = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : element.clientWidth
    const columns = Math.max(1, Math.round(element.clientWidth / Math.max(1, stride)))
    start.value = Math.min(count.value, Math.round(left / Math.max(1, stride)) + 1)
    end.value = Math.min(count.value, start.value + columns - 1)
  }

  function pause() { paused.value = true }

  function step(direction, automatic = false) {
    const element = track.value
    if (!element || !overflowing.value) return
    if (!automatic) pause()
    const max = Math.max(0, element.scrollWidth - element.clientWidth)
    const cards = element.children
    const gap = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft - cards[0].offsetWidth : 0
    const distance = element.clientWidth + Math.max(0, gap)
    const left = Math.max(0, element.scrollLeft)
    const target = direction > 0
      ? (left >= max - 2 ? 0 : Math.min(max, left + distance))
      : (left <= 2 ? max : Math.max(0, left - distance))
    element.scrollTo({ left: target, behavior: reduced.value ? 'instant' : 'smooth' })
  }

  function focusIn() { focused.value = true }
  function focusOut(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) focused.value = false
  }
  function preference() { reduced.value = media.matches }

  function observeTrack(element, previous) {
    if (previous) {
      resizeObserver?.unobserve(previous)
      intersectionObserver?.unobserve(previous)
    }
    visible.value = !intersectionObserver && Boolean(element)
    if (element) {
      resizeObserver?.observe(element)
      intersectionObserver?.observe(element)
    }
    measure()
    schedule()
  }

  watch([rotating, enabled], schedule)
  watch(count, async () => { await nextTick(); measure() })
  watch(track, observeTrack)
  onMounted(() => {
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference()
    media.addEventListener('change', preference)
    document.addEventListener('visibilitychange', schedule)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure)
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(entries => {
        visible.value = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.15)
      }, { threshold: 0.15 })
    }
    observeTrack(track.value)
  })
  onBeforeUnmount(() => {
    stop()
    media?.removeEventListener('change', preference)
    document.removeEventListener('visibilitychange', schedule)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
  })
  return { paused, reduced, overflowing, rotating, start, end, hovering, pause, step, measure, focusIn, focusOut }
}
