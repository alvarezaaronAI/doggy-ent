import HomeView from '../../domains/storefront/Home/HomeView.vue'
import CheckoutView from '../../domains/checkout/views/CheckoutView.vue'
import OrderSuccessView from '../../domains/checkout/views/OrderSuccessView.vue'
import { BRAND_STORY_PATH } from '../../domains/storefront/constants/brandContent.js'
import { POLICY_PAGES } from '../../domains/policies/content/policyPages.js'

export const publicRoutes = [
  ...Object.entries(POLICY_PAGES).map(([pageKey, page]) => ({
    path: page.path,
    name: `policy-${pageKey}`,
    component: () => import('../../domains/policies/views/PolicyView.vue'),
    props: { pageKey },
  })),
  { path: '/', name: 'home', component: HomeView },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
  { path: BRAND_STORY_PATH, name: 'meet-brand', component: () => import('../../domains/storefront/views/BrandView.vue') },
  { path: '/campaigns/:slug', name: 'campaign-detail', component: () => import('../../domains/campaigns/views/CampaignView.vue') },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  { path: '/order-success/:orderId', name: 'order-success', component: OrderSuccessView, props: true },
  { path: '/account/sign-in', name: 'account-sign-in', component: () => import('../../domains/account/views/AccountSignInView.vue') },
  { path: '/account/create', name: 'account-create', component: () => import('../../domains/account/views/AccountCreateView.vue') },
  { path: '/account/forgot-password', name: 'account-forgot-password', component: () => import('../../domains/account/views/AccountForgotPasswordView.vue') },
  { path: '/account/reset-password', name: 'account-reset-password', component: () => import('../../domains/account/views/AccountResetPasswordView.vue') },
  {
    path: '/account',
    component: () => import('../../domains/account/components/AccountLayout.vue'),
    meta: { requiresCustomerAuth: true },
    children: [
      { path: '', name: 'account-dashboard', component: () => import('../../domains/account/views/AccountDashboardView.vue') },
      { path: 'profile', name: 'account-profile', component: () => import('../../domains/account/views/AccountProfileView.vue') },
      { path: 'pets', name: 'account-pets', component: () => import('../../domains/account/views/AccountPetsView.vue') },
      { path: 'addresses', name: 'account-addresses', component: () => import('../../domains/account/views/AccountAddressesView.vue') },
      { path: 'orders', name: 'account-orders', component: () => import('../../domains/account/views/AccountOrdersView.vue') },
      { path: 'orders/:reference', name: 'account-order-detail', component: () => import('../../domains/account/views/AccountOrderDetailView.vue') },
      { path: 'help', name: 'account-help', component: () => import('../../domains/account/views/AccountHelpView.vue') },
      { path: 'rewards', name: 'account-rewards', component: () => import('../../domains/account/views/AccountFutureView.vue'), props: { kind: 'Rewards' } },
      { path: 'wishlist', name: 'account-wishlist', component: () => import('../../domains/account/views/AccountWishlistView.vue') },
    ],
  },
]
