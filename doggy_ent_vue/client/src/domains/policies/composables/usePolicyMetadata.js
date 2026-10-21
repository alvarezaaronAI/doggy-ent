import { onMounted, onUnmounted, watch } from 'vue'

export function usePolicyMetadata(page) {
  let previousTitle, robots, previousRobots, ownsRobots = false
  let stop
  onMounted(() => {
    previousTitle = document.title
    robots = document.querySelector('meta[name="robots"]')
    previousRobots = robots?.getAttribute('content')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.append(robots)
      ownsRobots = true
    }
    robots.content = 'noindex, nofollow'
    stop = watch(page, value => { document.title = `${value.label} | Chase & Evie Co. | Draft` }, { immediate: true })
  })
  onUnmounted(() => {
    stop?.()
    if (previousTitle != null) document.title = previousTitle
    if (ownsRobots) robots?.remove()
    else if (robots && previousRobots != null) robots.setAttribute('content', previousRobots)
    else robots?.removeAttribute('content')
  })
}
