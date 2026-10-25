import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { applicationSurfacePlugin, resolveApplicationSurface, validateAdminStorefrontOrigin } from './config/applicationSurface.js'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_')
  const surface = resolveApplicationSurface(mode, env.VITE_APP_SURFACE)
  validateAdminStorefrontOrigin(surface, command, env.VITE_STOREFRONT_ORIGIN)
  const routerFile = surface === 'combined' ? 'index' : surface
  return {
  plugins: [vue(), tailwindcss(), applicationSurfacePlugin(surface)],
  define: { __SHOP_APPLICATION_SURFACE__: JSON.stringify(surface) },
  resolve: {
    alias: {
      '@application-router': fileURLToPath(new URL(`./src/app/router/${routerFile}.js`, import.meta.url)),
      '@storefront-content': fileURLToPath(new URL('./src/domains/storefront/content', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@domains': fileURLToPath(new URL('./src/domains', import.meta.url)),
      '@storefront': fileURLToPath(new URL('./src/domains/storefront', import.meta.url)),
      '@products': fileURLToPath(new URL('./src/domains/products', import.meta.url)),
      '@cart': fileURLToPath(new URL('./src/domains/cart', import.meta.url)),
      '@checkout': fileURLToPath(new URL('./src/domains/checkout', import.meta.url)),
      '@payments': fileURLToPath(new URL('./src/domains/payments', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/domains/admin', import.meta.url)),
      '@promos': fileURLToPath(new URL('./src/domains/promos', import.meta.url)),
      '@campaigns': fileURLToPath(new URL('./src/domains/campaigns', import.meta.url)),
    },
  },
  server: {
    host: 'localhost',
    allowedHosts: ['localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  }
})
