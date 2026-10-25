import { createApplicationRouter } from './createApplicationRouter.js'
import { adminRoutes } from './admin.routes.js'

export default createApplicationRouter({ routes: [
  { path: '/', redirect: '/admin' },
  ...adminRoutes,
  { path: '/:pathMatch(.*)*', name: 'admin-not-found', component: () => import('../../domains/admin/views/AdminNotFoundView.vue') },
] })
