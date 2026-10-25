import { createRouter, createWebHistory } from 'vue-router'
import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

export function createApplicationRouter({ routes, history = createWebHistory() }) {
  const router = createRouter({
    history,
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) {
        return new Promise(resolve => setTimeout(() => resolve({ el: to.hash, top: 145 }), 100))
      }
      return { top: 0 }
    },
  })

  router.beforeEach(async to => {
    if (to.meta.requiresCustomerAuth) {
      try {
        const response = await fetchApi('/api/account/profile')
        await parseJsonResponse(response, 'Unable to validate account session.')
        if (response.ok) return true
      } catch {
        // Failed or unreadable session checks must not admit the route.
      }
      return { name: 'account-sign-in', query: { redirect: to.fullPath } }
    }

    if (!to.meta.requiresAdminAuth) return true
    try {
      const response = await fetchApi('/api/auth/me')
      const data = await parseJsonResponse(response, 'Unable to validate admin session.')
      if (response.ok && data.authenticated) return true
    } catch {
      // Backend authorization remains authoritative; this guard only controls navigation.
    }
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  })
  return router
}
