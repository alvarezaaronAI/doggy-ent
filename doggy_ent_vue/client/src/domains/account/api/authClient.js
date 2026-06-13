import { createAuthClient } from 'better-auth/vue'
import {
  dashClient,
} from '@better-auth/infra/client'
import {
  getApiBaseUrl,
} from '@shared/api/http.js'

export const customerAuthClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  basePath: '/api/customer-auth',
  plugins: [
    dashClient(),
  ],
})
