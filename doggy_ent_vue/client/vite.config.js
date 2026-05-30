import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@domains': fileURLToPath(new URL('./src/domains', import.meta.url)),
      '@storefront': fileURLToPath(new URL('./src/domains/storefront', import.meta.url)),
      '@products': fileURLToPath(new URL('./src/domains/products', import.meta.url)),
      '@cart': fileURLToPath(new URL('./src/domains/cart', import.meta.url)),
      '@checkout': fileURLToPath(new URL('./src/domains/checkout', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/domains/admin', import.meta.url)),
      '@promos': fileURLToPath(new URL('./src/domains/promos', import.meta.url)),
      '@campaigns': fileURLToPath(new URL('./src/domains/campaigns', import.meta.url)),
    },
  },
  server: {
    host: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})