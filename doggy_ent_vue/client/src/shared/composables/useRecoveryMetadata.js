import { onMounted, onUnmounted, watch } from 'vue'

export function useRecoveryMetadata(title) {
  let previousTitle, appliedTitle, robots, stop
  function restore() {
    robots?.remove()
    robots = undefined
    if (appliedTitle && document.title === appliedTitle) document.title = previousTitle
    previousTitle = appliedTitle = undefined
  }
  onMounted(() => {
    stop = watch(title, value => {
      if (!value) { restore(); return }
      if (!robots) {
        previousTitle = document.title
        robots = document.createElement('meta')
        robots.name = 'robots'
        robots.content = 'noindex, nofollow'
        document.head.append(robots)
      }
      appliedTitle = `${value} | Chase & Evie Co.`
      document.title = appliedTitle
    }, { immediate: true })
  })
  onUnmounted(() => { stop?.(); restore() })
}
