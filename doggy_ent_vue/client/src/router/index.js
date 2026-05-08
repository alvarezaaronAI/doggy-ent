import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminProductsView from '../views/admin/AdminProductsView.vue'
import AdminOrdersView from '../views/admin/AdminOrdersView.vue'
import AdminPromosView from '../views/admin/AdminPromosView.vue'
import AdminCampaignsView from '../views/admin/AdminCampaignsView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginView,
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: AdminProductsView,
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: AdminOrdersView,
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/admin/orders/:orderId',
    name: 'admin-order-detail',
    component: () => import('../views/admin/AdminOrderDetailView.vue'),
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/admin/promos',
    name: 'admin-promos',
    component: AdminPromosView,
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/admin/campaigns',
    name: 'admin-campaigns',
    component: AdminCampaignsView,
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdminAuth) return true

  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    })

    const data = await response.json()

    if (response.ok && data.authenticated) {
      return true
    }
  } catch (error) {
    // Continue to redirect below.
  }

  return {
    name: 'admin-login',
    query: { redirect: to.fullPath },
  }
})

export default router