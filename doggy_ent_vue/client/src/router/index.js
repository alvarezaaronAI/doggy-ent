import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminProductsView from '../views/admin/AdminProductsView.vue'
import AdminOrdersView from '../views/admin/AdminOrdersView.vue'
import AdminPromosView from '../views/admin/AdminPromosView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: AdminProductsView,
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: AdminOrdersView,
  },
  {
    path: '/admin/promos',
    name: 'admin-promos',
    component: AdminPromosView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router