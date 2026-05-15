import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../../domains/storefront/views/HomeView.vue'
import AdminDashboardView from '../../domains/admin/views/AdminDashboardView.vue'
import AdminProductsView from '../../domains/admin/views/AdminProductsView.vue'
import AdminOrdersView from '../../domains/admin/views/AdminOrdersView.vue'
import AdminPromosView from '../../domains/admin/views/AdminPromosView.vue'
import AdminCampaignsView from '../../domains/admin/views/AdminCampaignsView.vue'
import CheckoutView from '../../domains/checkout/views/CheckoutView.vue'
import OrderSuccessView from '../../domains/checkout/views/OrderSuccessView.vue'
import AdminLoginView from '../../domains/admin/views/AdminLoginView.vue'

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
    component: () => import('../../domains/admin/views/AdminOrderDetailView.vue'),
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
  {
    path: '/order-success/:orderId',
    name: 'order-success',
    component: OrderSuccessView,
    props: true,
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