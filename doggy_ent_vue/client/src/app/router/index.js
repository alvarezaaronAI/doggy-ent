import { createRouter, createWebHistory } from 'vue-router'
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'
import HomeView from '../../domains/storefront/Home/HomeView.vue'
import AdminDashboardView from '../../domains/admin/views/AdminDashboardView.vue'
import AdminProductsView from '../../domains/admin/views/AdminProductsView.vue'
import AdminOrdersView from '../../domains/admin/views/AdminOrdersView.vue'
import AdminPromosView from '../../domains/admin/views/AdminPromosView.vue'
import AdminCampaignsView from '../../domains/admin/views/AdminCampaignsView.vue'
import AdminCustomersView from '../../domains/admin/views/AdminCustomersView.vue'
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
    path: '/admin/customers',
    name: 'admin-customers',
    component: AdminCustomersView,
    meta: { requiresAdminAuth: true },
  },
  {
    path: '/admin/customers/:customerId',
    name: 'admin-customer-detail',
    component: () => import('../../domains/admin/views/AdminCustomerDetailView.vue'),
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
  {
    path: '/account/sign-in',
    name: 'account-sign-in',
    component: () => import('../../domains/account/views/AccountSignInView.vue'),
  },
  {
    path: '/account/create',
    name: 'account-create',
    component: () => import('../../domains/account/views/AccountCreateView.vue'),
  },
  {
    path: '/account/forgot-password',
    name: 'account-forgot-password',
    component: () => import('../../domains/account/views/AccountForgotPasswordView.vue'),
  },
  {
    path: '/account/reset-password',
    name: 'account-reset-password',
    component: () => import('../../domains/account/views/AccountResetPasswordView.vue'),
  },
  {
    path: '/account',
    name: 'account-dashboard',
    component: () => import('../../domains/account/views/AccountDashboardView.vue'),
    meta: { requiresCustomerAuth: true },
  },
  {
    path: '/account/profile',
    name: 'account-profile',
    component: () => import('../../domains/account/views/AccountProfileView.vue'),
    meta: { requiresCustomerAuth: true },
  },
  {
    path: '/account/orders',
    name: 'account-orders',
    component: () => import('../../domains/account/views/AccountOrdersView.vue'),
    meta: { requiresCustomerAuth: true },
  },
  {
    path: '/account/orders/:reference',
    name: 'account-order-detail',
    component: () => import('../../domains/account/views/AccountOrderDetailView.vue'),
    meta: { requiresCustomerAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta.requiresCustomerAuth) {
    try {
      const response = await fetchApi('/api/account/profile')

      await parseJsonResponse(
        response,
        'Unable to validate account session.',
      )

      if (response.ok) {
        return true
      }
    } catch (error) {
      // Continue to redirect below.
    }

    return {
      name: 'account-sign-in',
      query: { redirect: to.fullPath },
    }
  }

  if (!to.meta.requiresAdminAuth) return true

  try {
    const response = await fetchApi('/api/auth/me')

    const data = await parseJsonResponse(
      response,
      'Unable to validate admin session.',
    )

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
