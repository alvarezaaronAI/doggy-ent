import { createAuthClient } from 'better-auth/vue'
import {
  dashClient,
} from '@better-auth/infra/client'
import {
  getCustomerApiBaseUrl,
} from '@shared/api/http.js'

export const customerAuthClient = createAuthClient({
  baseURL: getCustomerApiBaseUrl(),
  basePath: '/api/customer-auth',
  plugins: [
    dashClient(),
  ],
})
